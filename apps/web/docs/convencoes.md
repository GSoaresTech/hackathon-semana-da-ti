# Convenções de código

## Nomes

| Item | Convenção | Exemplo |
|---|---|---|
| Arquivo / pasta | `kebab-case` | `create-user-form.tsx`, `users-store.ts` |
| Segmento dinâmico | `[camelCase]` | `[userId]` |
| Componente | `PascalCase` | `UsersList` |
| Props | `interface <Componente>Props` | `interface UsersListProps` |
| Hook | arquivo `use-*.ts`, função `useX` | `use-session.ts` → `useSession` |
| Store Zustand | arquivo `<recurso>-store.ts` | `users-store.ts` → `useUsers` |
| Entrada/saída de service | `<Verbo><Recurso>Input` / `Output` | `ListUsersOutput` |
| Constante de módulo | `SCREAMING_SNAKE_CASE` | `PER_PAGE`, `ROLES_OPTIONS` |
| Enum | `PascalCase` com membros `SCREAMING_SNAKE` | `Roles.ADMINISTRATOR` |

**Idioma:** identificadores em inglês, texto de interface e comentários em
português. Isso mantém o código legível para qualquer ferramenta e a interface
consistente para o usuário.

## Exports

Sem `export default`. Um `export { ... }` no fim do arquivo:

```ts
const UsersList: React.FC = () => { /* ... */ };

export { UsersList };
```

Por quê: default export permite importar com qualquer nome, o que faz o mesmo
componente aparecer com três nomes diferentes em três arquivos. Export nomeado
também dá autocomplete no import e renomeia direito no editor.

**Única exceção**, exigida pelo Next: `page.tsx`, `layout.tsx`, `loading.tsx`,
`error.tsx`, `global-error.tsx`, `not-found.tsx`, `route.ts`.

## Barrel files

Só use `index.tsx` quando a pasta contém **uma família de componentes**
(`components/heading/index.tsx`). Nesse caso o `index` é a implementação, não um
re-export.

Não crie barril para `ui/`, `forms/`, `services/`, `hooks/` ou `libs/` — importe
pelo caminho completo (`~/components/ui/button`). Barris grandes atrapalham
tree-shaking e criam ciclos de importação difíceis de rastrear.

## Ordem dos imports

1. `'use client'`
2. React e Next
3. Bibliotecas de terceiros
4. *(linha em branco)*
5. `~/libs` → `~/services` → `~/hooks` → `~/components`
6. Relativos (`./users-store`) por último

```tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

import { QUERIES } from '~/libs/queries';
import { listUsers } from '~/services/users';
import { ListRoot } from '~/components/ui/list';

import { useUsers } from './users-store';
```

## Onde ficam os tipos

**Colocados, e não exportados por padrão.**

- Schema Zod: no próprio arquivo do formulário, em escopo de módulo.
- Props: `interface` logo acima do componente.
- Entrada/saída de service: `type` logo acima da função.

Exporte um tipo só quando outro arquivo precisar dele — por exemplo,
`ListUsersOutput` é exportado porque `users-list.tsx` usa em
`setQueryData<ListUsersOutput>`.

Em `src/typings/` fica só o que é genuinamente global (hoje,
`PaginatedResponse<T>`). Não há `types.ts` nem `*.schema.ts` por feature.

## Componentes

Dois estilos coexistem e ambos são aceitos:

```tsx
// Preferido para componentes com props próprias
const UsersList: React.FC<UsersListProps> = ({ userId }) => { ... };

// Preferido em ui/, seguindo o shadcn
function Button({ className, ...props }: React.ComponentProps<'button'>) { ... }
```

Em `components/ui/` siga o shadcn à risca: `React.ComponentProps<'x'>`,
atributo `data-slot`, `cva` para variantes, `asChild` via `Slot`.

## Estilo

- Sempre `cn()` de `~/libs/utils` para juntar classes. Concatenar string
  quebra na hora de sobrescrever (`p-2` + `p-4` deixa os dois).
- Nunca cor fixa (`bg-blue-500`). Use os tokens: `bg-primary`,
  `text-muted-foreground`, `border-border`. Eles vêm de `globals.css` e são o
  que faz o tema funcionar.
- Nada de `tailwind.config.js` — Tailwind v4 é CSS-first. Ajustes de tema vão
  no `@theme inline` de [`src/app/globals.css`](../src/app/globals.css).

## Comentários

Comente **por quê**, não **o quê**. O código já diz o que faz.

```ts
// ruim: incrementa a página
setPage(page + 1);

// bom: manter a página ao filtrar levaria a uma lista vazia sem explicação
setSearch: (search) => set({ search, page: 1 }),
```

Vale comentar: decisões não óbvias, contornos de comportamento de biblioteca,
armadilhas conhecidas. Não vale: parafrasear a linha seguinte.
