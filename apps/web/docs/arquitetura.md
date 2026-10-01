# Arquitetura

## Ideia central

A aplicação é um **front-end que conversa com uma API REST externa**. O Next
serve a interface e faz o proxy do backend; ele não é o dono dos dados.

```
browser ──/api/*──> Next (rewrite) ──> backend (idh-server)
   │                   │
   │                   └─ proxy.ts: verifica o cookie de sessão
   └─ axios (~/libs/api): camelCase ⇄ snake_case, cookie httpOnly
```

Por que o rewrite existe: com `NEXT_PUBLIC_API_URL="/api"`, o browser só fala
com a própria origem. O cookie de sessão continua **first-party**, sem CORS e
sem token em JavaScript. Trocar isso por uma URL absoluta do backend quebraria
o modelo de autenticação inteiro.

## Estrutura de pastas

```
src/
├─ app/                     rotas (App Router) + código de cada tela
├─ components/
│  ├─ ui/                   primitivas shadcn + adições do projeto
│  ├─ forms/                formulários reaproveitados por várias rotas
│  ├─ guard/                controle de acesso na interface
│  └─ <familia>/index.tsx   container, heading, data, filter-popover
├─ hooks/                   hooks globais (use-session, use-guard, use-mobile)
├─ libs/                    infra: api, env, utils, queries, pages, formatters…
├─ providers/               providers React montados no layout
├─ services/                um arquivo por recurso do backend
├─ typings/                 tipos realmente globais
└─ proxy.ts                 antigo middleware.ts (ver docs/autenticacao.md)
```

## Onde colocar o código de uma tela

**Colocation:** tudo que só a tela usa mora na pasta da rota. Só sobe para
`components/` o que for reaproveitado por mais de uma rota.

```
app/(private)/(dashboard)/users/
├─ page.tsx                    Server Component: metadata + composição
├─ loading.tsx                 skeleton do segmento
├─ users-actions.tsx           busca + filtros + botão "novo"
├─ users-active-filters.tsx    chips de filtro ativo
├─ users-list.tsx              useQuery + a lista
├─ users-dropdown-menu.tsx     ações de cada linha
├─ users-store.ts              zustand: página, busca, filtros
├─ new/page.tsx
└─ [userId]/
   ├─ page.tsx
   ├─ user-data.tsx
   └─ edit/page.tsx
```

Os arquivos são **prefixados com o nome do recurso** (`users-list.tsx`, não
`list.tsx`). Com dez telas abertas no editor, dez abas escritas `list.tsx` são
indistinguíveis.

Exceção: formulários ficam em `components/forms/`, porque a tela de criar, a de
editar e um eventual modal consomem o mesmo componente.

## Grupos de rota

```
app/
├─ (public)/      sem sessão: signin, signout
└─ (private)/
   └─ (dashboard)/   com sessão: layout de sidebar + header
```

Parênteses não entram na URL — servem para dar um layout diferente a um
conjunto de rotas. `(public)` não tem layout próprio (tela cheia);
`(dashboard)` monta o shell da aplicação.

> Estar dentro de `(private)/` **não protege** a rota. Quem protege é o
> `proxy.ts`, comparando o caminho com o registro de
> [`src/libs/pages.ts`](../src/libs/pages.ts). Rota nova precisa ser registrada
> lá — ver [`autenticacao.md`](autenticacao.md).

## Server e Client Components

Regra prática: **`page.tsx` e `layout.tsx` ficam no servidor**; a
interatividade desce para arquivos irmãos com `'use client'`.

O `page.tsx` exporta `metadata`, monta o cabeçalho e compõe os filhos. Ele não
busca dados nem tem estado. Isso mantém o HTML inicial pequeno e concentra o
JavaScript nos pedaços que realmente precisam.

## Fronteiras entre camadas

| Camada | Pode importar | Não pode |
|---|---|---|
| `app/**` | components, hooks, services, libs | outro `app/**` de outra rota |
| `components/**` | components, hooks, libs, services | `app/**` |
| `services/**` | `libs/api`, `typings` | components, hooks |
| `libs/**` | outras libs | components, services |

A seta aponta sempre para baixo. Um `service` importar componente (para reusar
um tipo, por exemplo) inverte a dependência e é o começo de um ciclo.

## Variáveis de ambiente

Três arquivos, com papéis distintos:

- [`src/libs/env.schema.ts`](../src/libs/env.schema.ts) — os schemas, sem efeito
  colateral. Importável de qualquer lugar, inclusive do `next.config.ts`.
- [`src/libs/env.ts`](../src/libs/env.ts) — variáveis públicas (`NEXT_PUBLIC_*`),
  seguras no browser.
- [`src/libs/env.server.ts`](../src/libs/env.server.ts) — variáveis privadas,
  com `import 'server-only'`. Se um Client Component importar isso, o build
  falha — que é exatamente o objetivo.

O `next.config.ts` valida a env **antes** de qualquer uso, então uma variável
faltando falha o `npm run build` com a lista do que está errado, em vez de
quebrar em runtime longe da causa.

> Os arquivos `.env*` são lidos da **raiz** do projeto, nunca de `src/`.
