# Autenticação

## Quem precisa de login

**O paciente não.** Todo o fluxo de `app/(triage)/` é anônimo: não há conta,
cadastro nem cookie de sessão. O estado da triagem fica no `sessionStorage`
(ver [`estado.md`](estado.md)).

Só a **recepção das unidades** entra, para atualizar a lotação em `/unit`. É um
login simples: telefone + senha, e cada conta pertence a uma unidade.

## O contrato do backend

```
POST   /api/sessions     { phone, password }   → cookie httpOnly `token`
GET    /api/sessions/me                         → { user, unit }
DELETE /api/sessions                            → limpa o cookie
```

O cookie `token` é um JWT HS256 com `{ id, unit_id, name }`, assinado com o
`SESSION_SECRET` do backend e válido por **12 horas**. Não existe endpoint de
refresh: venceu, entra de novo.

As funções ficam em [`src/services/sessions.ts`](../src/services/sessions.ts):
`createSession`, `getMe` e `deleteSession`.

## Verificando a sessão no servidor

O JavaScript do browser **nunca** vê o JWT (httpOnly). Quem lê o cookie é o
servidor do Next, em [`src/libs/session.ts`](../src/libs/session.ts):

```ts
interface Session {
  userId: string;
  unitId: string;
  name: string;
}

verifySession(token?: string): Promise<Session | null>
```

- Usa `jose` com o **mesmo** `SESSION_SECRET` do backend — só para verificar,
  nunca para emitir. Segredo diferente = todo token válido é rejeitado.
- Verifica assinatura e expiração de verdade. Conferir só a presença do
  cookie aceitaria um valor forjado por qualquer um.
- Normaliza o payload (`unit_id` → `unitId`): o JWT não passa pelo interceptor
  do axios.
- É `server-only`. Client Component que precisa dos dados da sessão chama
  `getMe()` com `useQuery` e `QUERIES.GET_ME` — é o que faz
  [`unit-occupancy.tsx`](<../src/app/(unit)/unit/unit-occupancy.tsx>).

## O proxy (antigo middleware)

No Next 16 o arquivo chama-se **`proxy.ts`** e a função exportada, **`proxy`**.
O runtime é sempre `nodejs`, o que permite verificar o JWT com `jose`.

[`src/proxy.ts`](../src/proxy.ts) faz duas coisas:

1. `/unit/**` sem sessão válida → `/signin?redirect=<destino>`.
2. `/signin` com sessão válida → `/unit`.

```ts
const PROTECTED_PATHS = [/^\/unit(\/.*)?$/];

export const config = {
  matcher: ['/unit/:path*', '/signin'],
};
```

O `matcher` restrito é de propósito: o fluxo do paciente não paga o custo de
verificar JWT a cada navegação. **Rota nova da recepção vai dentro de
`/unit`** — assim ela já nasce protegida, sem mexer no proxy.

> O proxy é **UX, não autorização**. Ele evita renderizar uma tela que a pessoa
> não pode ver; quem autoriza de verdade (por exemplo, se esta unidade pode
> mudar aquela lotação) é o backend.

## Login

[`components/forms/signin-form.tsx`](../src/components/forms/signin-form.tsx):
máscara de telefone com Maskito, `createSession` e, no sucesso,
`router.replace` para o `?redirect=` seguido de `router.refresh()`.

O `redirect` só é aceito se começar com `/unit`. Qualquer outro valor cai em
`/unit` — sem isso, `?redirect=https://site-falso` viraria um *open redirect*.

## Sessão expirada

1. Uma chamada da área `/unit` volta 401.
2. O interceptor de [`src/libs/api.ts`](../src/libs/api.ts) manda para
   `/signin?redirect=<página atual>`.

Duas exceções, de propósito:

- **Só redireciona se a página atual começa com `/unit`.** O fluxo do paciente
  é anônimo e não deve ser jogado para um login que não é dele.
- **`POST /sessions` com 401 não redireciona**: é senha errada, e a mensagem
  precisa chegar ao formulário como erro comum (no toast).

O redirecionamento é uma navegação "dura" (`window.location.href`), não
`router.push`: recarregar descarta o cache do React Query e os formulários
abertos.

## Logout

`/signout` ([`signout/effect.tsx`](<../src/app/(unit)/signout/effect.tsx>))
chama `DELETE /api/sessions`, limpa o cache com `queryClient.removeQueries()` e
volta para `/signin` — mesmo se o backend falhar. Um `useRef` impede o Strict
Mode de disparar o `DELETE` duas vezes.
