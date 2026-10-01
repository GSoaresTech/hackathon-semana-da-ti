# Autenticação e controle de acesso

## O contrato do backend

O `idh-server` usa **dois cookies httpOnly** e um login em **dois passos** —
porque um usuário pode ter mais de um perfil (empresa/estabelecimento) e a
sessão é sempre de um perfil específico.

```
1. POST /sessions/authenticate  { cpf, password }   → cookie `authorization`
2. GET  /users/me/profiles                          → perfis do usuário
3. POST /sessions               { profileId }       → cookie `token`, limpa `authorization`
4. DELETE /sessions                                 → limpa os dois
```

| Cookie | Conteúdo do JWT | Quando existe |
|---|---|---|
| `authorization` | `{ id }` | entre o passo 1 e o 3 |
| `token` | `{ id, profile_id, company_id, role, situation, installation_id }` | sessão ativa |

Ambos HS256, validade de 1 dia, assinados com o `SECRET` do backend.

**Não existe endpoint de refresh** e **não existe `GET /sessions`**. As duas
ausências moldam o resto deste documento.

## Como a sessão chega à interface

O cookie é httpOnly: o JavaScript do browser não consegue lê-lo. E o backend
não oferece um endpoint para consultar a sessão atual. A solução é um Route
Handler local:

```
useSession()  →  GET /session  →  verifySession(cookie)  →  { session }
   (client)      (nosso handler,      (jose, server-only)
                  não o backend)
```

- [`src/app/session/route.ts`](../src/app/session/route.ts) — roda no servidor,
  lê o cookie, verifica o JWT e devolve só o que a interface precisa.
- [`src/libs/session.ts`](../src/libs/session.ts) — `verifySession`, com `jose`.
  Normaliza o payload de `snake_case` para `camelCase` (o JWT não passa pelo
  interceptor do axios).

O handler fica em `/session` e **não** em `/api/session` de propósito: `/api/*`
é reescrito para o backend no `next.config.ts`, e um handler ali dependeria da
ordem de precedência entre rewrite e sistema de arquivos.

## O proxy (antigo middleware)

No Next 16 o arquivo chama-se **`proxy.ts`** e a função exportada, **`proxy`**.
O runtime é sempre `nodejs` e não é configurável — o que aqui é vantagem: dá
para verificar o JWT com `jose` sem restrição de edge runtime.

[`src/proxy.ts`](../src/proxy.ts) faz, em ordem:

1. Verifica o cookie de sessão (assinatura e expiração de verdade — **não**
   apenas a presença do cookie, que qualquer um pode forjar).
2. `/` → redireciona conforme o papel, ou para `/signin`.
3. `/signin` com sessão válida → manda para a rota inicial do papel.
4. Procura o caminho em [`src/libs/pages.ts`](../src/libs/pages.ts).
   **Rota não registrada é pública.**
5. Sem sessão numa rota registrada → `/signin?redirect=<destino>`.
6. Com sessão mas sem papel suficiente → rota inicial do papel.

### O `matcher` não é opcional

```ts
export const config = {
  matcher: ['/((?!api|session|_next/static|_next/image|.*\\.[\\w]+$).*)'],
};
```

Sem ele o proxy roda em **toda** requisição — incluindo assets estáticos e
prefetches de navegação —, verificando JWT à toa e adicionando latência a cada
link que o usuário passa o mouse por cima.

## Registrar uma rota protegida

Proteção não vem da pasta. Estar em `app/(private)/` não protege nada. O que
protege é o registro em [`src/libs/pages.ts`](../src/libs/pages.ts):

```ts
{
  id: 'users',
  title: 'Colaboradores',
  url: '/users',
  icon: UsersIcon,
  regex: /^\/users(\/.*)?$/,          // pega a rota e as subrotas
  roles: [Roles.SYSTEM, Roles.ADMINISTRATOR, Roles.HR],
}
```

Uma entrada só alimenta três coisas: o item da sidebar, a proteção no proxy e o
filtro de papéis. Fonte única — menu e guarda não conseguem discordar.

Cuidado com o `regex`: `/^\/users$/` protegeria só a listagem e deixaria
`/users/123` aberta.

## Guards na interface

```tsx
<RouteGuard roles={[Roles.SYSTEM, Roles.ADMINISTRATOR]}>
  <Container>{/* ... */}</Container>
</RouteGuard>
```

O proxy já barra o acesso direto pela URL. O `RouteGuard` cobre a **navegação
client-side**, que não passa pelo proxy.

> **Guard é UX, não segurança.** Ele esconde a tela; não protege o endpoint por
> trás dela. Quem autoriza de verdade é o backend. Nunca dependa de um guard
> para impedir acesso a dado.

O [`useGuard`](../src/hooks/use-guard.ts) recebe `isLoading` e não redireciona
enquanto a sessão carrega — sem isso, `canAccess` seria `false` no primeiro
render e todo mundo cairia fora antes de a permissão ser conhecida.

## Papéis

Em [`src/libs/constants.ts`](../src/libs/constants.ts):

```ts
export enum Roles {
  SYSTEM = 0,
  ADMINISTRATOR = 1,
  MANAGER = 2,
  HR = 3,
  EMPLOYEE = 4,
}
```

São números porque é assim que o backend armazena. Nunca compare com o literal
(`role === 1`) — use `Roles.ADMINISTRATOR`.

Permissões são **predicados por capacidade**, não por tela:

```ts
export function canManageUsers(role?: Roles): boolean {
  return role === Roles.SYSTEM || role === Roles.ADMINISTRATOR || role === Roles.HR;
}
```

Assim uma tela nova reaproveita o predicado em vez de inventar outra regra.

A função [`canAccess`](../src/libs/access.ts) combina papel e feature flag, e é
pura: mesma resposta no servidor (proxy) e no cliente (sidebar, guards).

## O que acontece quando a sessão expira

Sem endpoint de refresh, o cookie simplesmente vence em 1 dia:

1. A próxima chamada volta 401.
2. O interceptor do axios redireciona para `/signin`.
3. É uma navegação "dura" (`window.location.href`), não `router.push` — de
   propósito: recarregar descarta todo o estado em memória (cache do Query,
   stores, formulários). Sem isso, dados de quem saiu continuariam na tela
   depois do login de outra pessoa.

`/signout` faz o mesmo de forma ordenada: chama `DELETE /sessions`, limpa o
cache com `queryClient.removeQueries()` e volta ao login — mesmo se o backend
falhar.

### Se o seu backend tiver refresh

A mecânica está pronta em [`src/libs/api.ts`](../src/libs/api.ts): tentativa
única por requisição, *single-flight* e serialização entre abas com
`navigator.locks` (necessária quando o refresh token é de uso único, senão duas
abas renovando juntas fazem a segunda falhar e deslogar o usuário).

Basta apontar a constante:

```ts
const REFRESH_ENDPOINT: string | null = '/sessions/refresh';
```

Nada mais precisa mudar.

## Testar sem backend

Bloqueie tudo e libere o que interessa — ver
[`tests/signin.spec.ts`](../tests/signin.spec.ts):

```ts
test.beforeEach(async ({ page }) => {
  await page.route('**/api/**', (route) => route.abort());
});
```

Sem o bloqueio geral, uma chamada não mockada fica pendurada até o timeout e,
pior, o interceptor trata a falha como sessão expirada e redireciona no meio do
teste. No Playwright a rota registrada por último vence, então mocks
específicos vêm depois.
