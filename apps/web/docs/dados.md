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
  parâmetros de query (raso). `travelMinutes` no front é `travel_minutes` na
  API.
- **Erros normalizados.** Qualquer falha vira `Error` com a mensagem do campo
  `error` da API, pronta para exibir. Por isso não se usa `try/catch`.
- **401 na área da recepção.** Se a página atual começa com `/unit`, manda para
  `/signin?redirect=`. No fluxo do paciente (anônimo) nunca redireciona. Ver
  [`autenticacao.md`](autenticacao.md).

`FormData`, `Blob` e `URLSearchParams` passam intactos: converter as chaves
deles destruiria o corpo da requisição.

## 2. A camada de service

Um arquivo por recurso do backend. Toda chamada HTTP do projeto está aqui.

| Arquivo | Funções | Endpoints |
|---|---|---|
| [`symptoms.ts`](../src/services/symptoms.ts) | `listSymptoms` | `GET /symptoms` |
| [`triage.ts`](../src/services/triage.ts) | `createTriage` | `POST /triage` |
| [`units.ts`](../src/services/units.ts) | `listUnits`, `updateOccupancy` | `GET /units`, `PATCH /units/:unitId/occupancy` |
| [`cards.ts`](../src/services/cards.ts) | `createCard` | `POST /cards` |
| [`sessions.ts`](../src/services/sessions.ts) | `createSession`, `getMe`, `deleteSession` | `POST`/`DELETE /sessions`, `GET /sessions/me` |

(Os caminhos são relativos a `NEXT_PUBLIC_API_URL`, ou seja, `/api/units` no
browser.)

```ts
// src/services/units.ts
type ListUnitsInput = {
  level: UrgencyLevel;
  network: Network;
  lat?: number;
  lng?: number;
};

type ListUnitsOutput = {
  units: ListedUnit[];
  notice: string | null;
};

export async function listUnits(input: ListUnitsInput): Promise<ListUnitsOutput> {
  const { data } = await api.get('/units', { params: input });

  return data;
}
```

Convenções:

- Tipos `Input` / `Output` logo acima da função. `export` só quando outro
  arquivo precisar (ex.: `ListedUnit`, usado pelo `UnitCard`).
- Um único argumento em objeto, sempre.
- Retorna `data` direto. **O tipo declarado é uma afirmação de confiança sobre
  o contrato, não uma validação** — não há parse da resposta. Se o backend
  mudar, o TypeScript não avisa; o erro aparece em runtime.
- Valores de enum são os do contrato, em inglês (`'public'`, `'low'`). O texto
  de tela vem dos `*_LABELS` de `libs/constants.ts`.
- Filtro vazio vira `undefined` para o axios omitir o parâmetro em vez de
  mandar `lat=`.

## 3. Queries

### Chaves

Toda chave vem do enum `QUERIES` em [`src/libs/queries.ts`](../src/libs/queries.ts)
(`LIST_SYMPTOMS`, `LIST_UNITS`, `CREATE_CARD`, `GET_ME`). Filtros vão no
**segundo item** do array, nunca embutidos no nome — do
[`units-view.tsx`](<../src/app/(triage)/units/units-view.tsx>):

```ts
const { data, isPending } = useQuery({
  queryKey: [QUERIES.LIST_UNITS, { level, network, ...origin }],
  queryFn: () => listUnits({ level, network, lat: origin.lat, lng: origin.lng }),
  enabled: ready,
  refetchInterval: REFETCH_INTERVAL_MS, // a lotação muda ao vivo
  staleTime: 0,
});
```

Tudo que muda a resposta entra na chave. Esquecer um campo é como o cache
passa a servir o resultado de um filtro para outro.

Com filtros no segundo item, `invalidateQueries({ queryKey: [QUERIES.LIST_UNITS] })`
invalida todas as combinações de uma vez — é o que a tela `/unit` faz depois
de mudar a lotação.

### `POST` como query

O cartão de triagem é um `POST /cards`, mas
[`card-view.tsx`](<../src/app/(triage)/card/card-view.tsx>) usa `useQuery` com
`[QUERIES.CREATE_CARD, summary]` e `staleTime: Infinity`: o mesmo resumo
reaproveita o cartão do cache em vez de gerar um token novo a cada visita à
tela. Só vale para POST sem efeito colateral relevante (o backend não grava
nada).

### Estados

```tsx
if (isPending) // primeira carga: mostre skeleton
if (isError)   // o interceptor já pôs a mensagem em error.message
```

Skeleton com a forma do conteúdo final (três cards de unidade, chips de
larguras variadas) evita que a tela pule quando os dados chegam.

## 4. Mutations

Dois formatos, conforme a tela:

**Formulário** — `mutateAsync` + `toast.promise`, sem `try/catch` (ver
[`formularios.md`](formularios.md)):

```tsx
toast.promise(mutateAsync(values), {
  loading: 'Entrando…',
  success: () => { /* navega */ return 'Bem-vindo de volta'; },
  error: (error: Error) => error.message,
});
```

**Passo do fluxo** — `mutate` com `onSuccess` decidindo a próxima tela e
`onError` com toast. Do
[`symptoms-form.tsx`](<../src/app/(triage)/symptoms/symptoms-form.tsx>):

```tsx
const { mutate, isPending } = useMutation({
  mutationFn: createTriage,
  onSuccess: (result) => {
    if (result.emergency) {
      setEmergency(result);
      router.push('/emergency');
      return;
    }

    router.push('/questions');
  },
  onError: (error) => toast.error(error.message),
});

function handleContinue() {
  if (isPending || !canContinue) return; // trava o duplo clique

  mutate({ network, symptoms, description: description.trim() || null });
}
```

O resultado da triagem vai para o **store** (`setEmergency`, `setResult`)
porque as telas seguintes precisam dele e ele não pode ser refeito por uma
query — ver [`estado.md`](estado.md).

### Invalidar ou escrever no cache?

- **`invalidateQueries`** — quando outra lista precisa ser buscada de novo
  (a ordenação pode ter mudado): `LIST_UNITS` depois de mudar a lotação.
- **`setQueryData`** — para atualizar na hora o item já em tela, sem refetch.
  Do [`unit-occupancy.tsx`](<../src/app/(unit)/unit/unit-occupancy.tsx>):

```tsx
onSuccess: ({ unit }) => {
  queryClient.setQueryData([QUERIES.GET_ME], (current: typeof data) =>
    current ? { ...current, unit } : current,
  );
  queryClient.invalidateQueries({ queryKey: [QUERIES.LIST_UNITS] });
},
```

## 5. Defaults do QueryClient

Em [`src/providers/query-client-provider.tsx`](../src/providers/query-client-provider.tsx):

| Opção | Valor | Motivo |
|---|---|---|
| `staleTime` | 30 min | Catálogo de sintomas e sessão mudam pouco. Quem precisa de dado fresco sobrescreve (`/units` usa `0` + `refetchInterval`). |
| `retry` | 1 | Mais tentativas só multiplicam a chamada. |
| `refetchOnWindowFocus` | `false` | Voltar ao app não deve recarregar a tela inteira. |

O `QueryClient` nasce dentro de `useState`. Em escopo de módulo ele seria
compartilhado entre requisições diferentes no servidor, vazando cache de um
usuário para o outro.
