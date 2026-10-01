# Dados: axios, services e TanStack Query

Três camadas, cada uma com um trabalho só:

| Camada | Arquivo | Responsabilidade |
|---|---|---|
| Transporte | [`src/libs/api.ts`](../src/libs/api.ts) | cookies, tradução de case, erros, 401 |
| Contrato | `src/services/<recurso>.ts` | endpoints e tipos de entrada/saída |
| Estado | `useQuery` / `useMutation` no componente | cache, loading, invalidação |

## 1. O cliente HTTP

Instância única, configurada uma vez. **Componente nunca importa `axios`.**

O que o interceptor faz por você:

- **Cookie httpOnly** (`withCredentials`). Não existe token em JavaScript.
- **Tradução de case.** Você escreve `camelCase`; ele envia `snake_case` e
  converte a resposta de volta. Vale para o corpo (profundo) e para os
  parâmetros de query (raso).
- **Erros normalizados.** Qualquer falha vira `Error` com a mensagem do campo
  `error` da API, pronta para exibir. Por isso não se usa `try/catch`.
- **401.** Redireciona para `/signin`. A mecânica de refresh existe e está
  pronta, mas desligada — ver a nota no fim deste documento.

`FormData`, `Blob` e `URLSearchParams` passam intactos: converter as chaves
deles destruiria o corpo da requisição.

## 2. A camada de service

Um arquivo por recurso do backend. Toda chamada HTTP do projeto está aqui.

```ts
// src/services/users.ts
type ListUsersInput = {
  page?: number;
  search?: string;
};

export type ListUsersOutput = PaginatedResponse<{
  id: string;
  name: string;
  createdAt: string;   // o backend manda created_at; o interceptor converte
}>;

export async function listUsers(input: ListUsersInput): Promise<ListUsersOutput> {
  const { data } = await api.get('/users', {
    params: { page: input.page, search: input.search || undefined },
  });

  return data;
}
```

Convenções:

- Tipos `Input` / `Output` logo acima da função. `export` só quando outro
  arquivo precisar (ex.: `setQueryData<ListUsersOutput>`).
- Um único argumento em objeto, sempre.
- Retorna `data` direto. **O tipo declarado é uma afirmação de confiança sobre
  o contrato, não uma validação** — não há parse da resposta. Se o backend
  mudar, o TypeScript não avisa; o erro aparece em runtime.
- Filtro vazio vira `undefined` (`input.search || undefined`) para o axios
  omitir o parâmetro em vez de mandar `search=`.

## 3. Queries

### Chaves

Toda chave vem do enum `QUERIES` em [`src/libs/queries.ts`](../src/libs/queries.ts).
Filtros vão no **segundo item** do array, nunca embutidos no nome:

```ts
const filters = { page, limit: PER_PAGE, search, situation, role };
const queryKey = [QUERIES.LIST_USERS, filters];

const { data, isPending } = useQuery({
  queryKey,
  queryFn: () => listUsers(filters),
});
```

O mesmo objeto `filters` vai para a chave e para a chamada. Montar os dois
separadamente é como o cache passa a servir o resultado de um filtro para
outro.

Com filtros no segundo item, `invalidateQueries({ queryKey: [QUERIES.LIST_USERS] })`
invalida todas as combinações de filtro de uma vez.

### Estados

```tsx
if (isPending) // primeira carga: mostre skeleton
if (isError)   // o interceptor já pôs a mensagem em error.message
```

Preencha a lista com um número **fixo** de linhas (skeleton quando carregando,
linha vazia quando a página vem incompleta). A altura constante impede que o
rodapé de paginação pule de lugar — ver `users-list.tsx`.

## 4. Mutations

Padrão único, sem `try/catch`:

```tsx
const { mutateAsync, isPending } = useMutation({
  mutationFn: createUser,
  onSuccess: (data) => {
    queryClient.invalidateQueries({ queryKey: [QUERIES.LIST_USERS] });
    router.push(`/users/${data.id}`);
  },
});

function handleCreateUser(values: FormValues) {
  if (isPending) return;             // trava o duplo clique

  const promise = mutateAsync(values);

  toast.promise(promise, {
    loading: 'Cadastrando...',
    success: 'Colaborador cadastrado com sucesso!',
    error: (error) => error.message, // mensagem que veio da API
  });
}
```

### Invalidar ou escrever no cache?

- **`invalidateQueries`** — depois de criar, editar ou excluir. A lista precisa
  ser buscada de novo mesmo (a ordenação ou a paginação podem ter mudado).
- **`setQueryData`** — para alterações pontuais de um item já em tela, como
  ativar/inativar. Evita o refetch, a lista não pisca e o usuário não perde a
  posição de rolagem:

```tsx
onSuccess: (_, { userId, situation }) => {
  queryClient.setQueryData<ListUsersOutput>(queryKey, (old) => {
    if (!old) return old;

    return {
      ...old,
      data: old.data.map((user) =>
        user.id === userId ? { ...user, situation } : user,
      ),
    };
  });
}
```

## 5. Defaults do QueryClient

Em [`src/providers/query-client-provider.tsx`](../src/providers/query-client-provider.tsx):

| Opção | Valor | Motivo |
|---|---|---|
| `staleTime` | 30 min | Dado cadastral muda pouco; evita refetch a cada navegação. |
| `retry` | 1 | O interceptor já trata 401. Mais tentativas só multiplicam a chamada. |
| `refetchOnWindowFocus` | `false` | Alt-tab não deve recarregar a tela inteira. |

O `QueryClient` nasce dentro de `useState`. Em escopo de módulo ele seria
compartilhado entre requisições de usuários diferentes no servidor, vazando
cache de um para o outro.

## Nota: renovação de sessão

O backend deste projeto (`idh-server`) **não expõe endpoint de refresh** — o
cookie vale 1 dia e expira. Por isso `REFRESH_ENDPOINT` em
[`src/libs/api.ts`](../src/libs/api.ts) é `null` e o 401 leva direto ao login.

A mecânica completa está implementada e testada logo abaixo dessa constante:
tentativa única por requisição, *single-flight* (uma renovação para N chamadas
simultâneas) e serialização entre abas via `navigator.locks` — necessária
quando o refresh token é de uso único, já que duas abas renovando juntas fariam
a segunda falhar e deslogar o usuário.

Para um backend com refresh, aponte a constante para o endpoint. Nada mais
precisa mudar.
