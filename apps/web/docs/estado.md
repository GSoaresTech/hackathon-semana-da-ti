# Estado com Zustand

## A divisão que importa

| Tipo de estado | Onde mora | Exemplos |
|---|---|---|
| Dado que veio do servidor | **TanStack Query** | lista de usuários, detalhe, sessão |
| Estado de interface | **Zustand** | página atual, busca, filtros, seleção |
| Estado de um componente só | `useState` | popover aberto, aba ativa |

**Nunca copie resposta de API para dentro de uma store.** Duas fontes de
verdade divergem: uma mutação atualiza o cache do Query e a store fica com o
valor velho, sem nada avisando.

## O padrão

Uma store por tela de lista, colocada na pasta da rota
(`users-store.ts` ao lado de `users-list.tsx`).

```ts
import { create } from 'zustand';

interface UsersStore {
  page: number;
  search: string;
  situation: number | null;

  reset: () => void;
  setPage: (page: number) => void;
  setSearch: (search: string) => void;
  setSituation: (situation: number | null) => void;
}

const defaultStore: Pick<UsersStore, 'page' | 'search' | 'situation'> = {
  page: 1,
  search: '',
  situation: null,
};

const useUsers = create<UsersStore>((set) => ({
  ...defaultStore,

  reset: () => set(defaultStore),
  setPage: (page) => set({ page }),
  setSearch: (search) => set({ search, page: 1 }),
  setSituation: (situation) => set({ situation, page: 1 }),
}));

export { useUsers };
```

Três detalhes que não são acidentais:

1. **`defaultStore` separado.** O `reset()` reaproveita o objeto em vez de
   repetir os valores — e quando um filtro novo entrar, ele já é resetado junto.
2. **Filtro volta para a página 1.** Manter a página 5 depois de filtrar
   costuma levar a uma lista vazia que o usuário não sabe explicar.
3. **Sem `situation: undefined`.** Use `null` para "sem filtro". `undefined`
   some do objeto e atrapalha comparar chaves de query.

## Consumindo

```tsx
const { page, search, setPage } = useUsers();
```

Desestruturar a store inteira faz o componente re-renderizar a cada mudança de
qualquer campo. Para as listagens deste projeto isso é irrelevante — são poucos
campos e o componente já re-renderiza quando a query muda.

Se um dia uma store crescer e o custo aparecer, use `useShallow`:

```tsx
import { useShallow } from 'zustand/react/shallow';

const { page, setPage } = useUsers(
  useShallow((state) => ({ page: state.page, setPage: state.setPage })),
);
```

## Filtros não vão para a URL

Decisão consciente deste template: o estado de filtro vive só na store.

- **Ganho:** simplicidade. Sem serializar, parsear e sincronizar.
- **Custo:** a URL não reflete a tela. Não dá para compartilhar link de lista
  filtrada, e o botão voltar não desfaz um filtro.

Para compensar, toda listagem tem um `<recurso>-active-filters.tsx` mostrando
chips do que está aplicado — senão a pessoa volta para a tela e não entende por
que a lista está curta.

Se um projeto precisar de link compartilhável, o lugar de mudar é um hook que
espelhe a store em `searchParams`, mantendo a mesma API para os componentes.

## Middlewares

Nenhuma store do template usa middleware. Quando precisar:

```ts
import { persist } from 'zustand/middleware';

const useSidebar = create<SidebarStore>()(
  persist(
    (set) => ({ open: true, toggle: () => set((s) => ({ open: !s.open })) }),
    { name: 'sidebar-state' },
  ),
);
```

Repare no `create<T>()(...)` — com middleware são **duas** chamadas; é assim
que o TypeScript infere os tipos corretamente.

`persist` serve para preferência de interface (sidebar recolhida, tema). Não
persista filtro de listagem: o usuário volta dias depois e encontra a lista
filtrada sem lembrar por quê.

> `persist` escreve no `localStorage` e roda só no cliente. Num componente
> renderizado no servidor, o primeiro render usa o estado inicial e o valor
> salvo entra depois da hidratação — o que pode causar um flash. Use
> `skipHydration` ou renderize esse trecho apenas no cliente.

## Estado de rascunho

Store também serve para acumular itens antes de enviar (um carrinho, uma
seleção múltipla). Derive o tipo do item do retorno do service, para não
redeclarar a mesma forma:

```ts
type User = Awaited<ReturnType<typeof listUsers>>['data'][number];

interface SelectionStore {
  selected: User[];
  add: (user: User) => void;
  clear: () => void;
}
```

Assim, quando o backend mudar o formato, o tipo acompanha sozinho.
