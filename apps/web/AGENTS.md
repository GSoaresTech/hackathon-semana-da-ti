<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Instruções do projeto

> O bloco acima é gerenciado pelo `next dev`. **Não edite nada entre os
> marcadores `BEGIN`/`END`** — ele é reescrito automaticamente. Regras do
> projeto vão daqui para baixo.

Este repositório é o **template de aplicação web** da equipe. O código existente
é a referência: antes de criar um padrão novo, procure um equivalente já pronto
e siga-o.

## Regra de ouro

**Padrão existente no repositório vence preferência pessoal.** Se já existe uma
tela, componente ou serviço parecido com o que você vai escrever, copie a
estrutura dele. Consistência aqui vale mais do que elegância pontual.

## Stack

| Camada | Escolha |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) + React 19.2 |
| Linguagem | TypeScript `strict` |
| Estilo | Tailwind CSS v4 (CSS-first, **sem** `tailwind.config.js`) + shadcn/ui sobre Radix |
| Estado de servidor | TanStack Query v5 |
| Estado de UI | Zustand v5 |
| Formulários | React Hook Form + Zod **v4** |
| HTTP | Axios (instância única em `~/libs/api`) |
| Notificações | Sonner (`toast`) |
| Datas | dayjs (via `~/libs/dayjs`) |
| Máscaras | Maskito |
| E2E | Playwright |

## Antes de escrever código

1. Leia o guia relevante em `node_modules/next/dist/docs/` (ver bloco acima).
2. Leia o documento correspondente em [`docs/`](docs/) — são curtos e mostram
   o padrão com código real deste repositório:
   - [`docs/arquitetura.md`](docs/arquitetura.md) — estrutura de pastas e o que vai onde
   - [`docs/convencoes.md`](docs/convencoes.md) — nomes, exports, imports
   - [`docs/dados.md`](docs/dados.md) — axios, services e TanStack Query
   - [`docs/formularios.md`](docs/formularios.md) — React Hook Form + Zod
   - [`docs/estado.md`](docs/estado.md) — Zustand
   - [`docs/componentes.md`](docs/componentes.md) — padrão de subcomponentes
   - [`docs/autenticacao.md`](docs/autenticacao.md) — sessão, proxy e guards

## Regras inegociáveis

### Nomenclatura

- **Arquivos e pastas:** `kebab-case`, sempre. `create-user-form.tsx`,
  `users-store.ts`, `use-session.ts`.
- **Código:** `camelCase` para variáveis, propriedades e funções; `PascalCase`
  para componentes e tipos; `SCREAMING_SNAKE_CASE` para constantes de módulo.
- **O front é camelCase de ponta a ponta.** O backend fala `snake_case`, mas o
  interceptor em [`src/libs/api.ts`](src/libs/api.ts) traduz nos dois sentidos.
  Nunca escreva `snake_case` em tipo, estado ou props.

### Exports

- **Não use `export default`.** Use `export { NomeDoComponente }` no fim do
  arquivo.
- **Única exceção:** arquivos de rota do App Router (`page.tsx`, `layout.tsx`,
  `loading.tsx`, `error.tsx`, `not-found.tsx`, `global-error.tsx`, `route.ts`),
  que o Next exige com default.

### Camadas

- **Toda chamada HTTP** passa por uma função em `~/services/*`, que usa a
  instância `api` de `~/libs/api`. Componente não importa `axios` e não chama
  `api` direto.
- **Toda chave de query** vem do enum `QUERIES` em
  [`src/libs/queries.ts`](src/libs/queries.ts). Nunca string solta em `queryKey`.
- **Todo formulário** usa `react-hook-form` + `zod` + `@hookform/resolvers/zod`.
- **Dado de servidor** mora no TanStack Query; **estado de UI** (filtros,
  paginação, seleção) mora no Zustand. Não duplique um no outro.

### Erros

- Não use `try/catch` em componente. O interceptor do axios já normaliza
  qualquer falha em `Error` com mensagem pronta para o usuário.
- Feedback de mutação é sempre
  `toast.promise(promise, { loading, success, error: (e) => e.message })`.

### Segurança

- `proxy.ts` e os `RouteGuard` são **UX**, não autorização. Quem autoriza é o
  backend. Nunca trate um guard de tela como proteção de dado.
- Segredo nunca em `NEXT_PUBLIC_*`. Variável privada vai em
  [`src/libs/env.server.ts`](src/libs/env.server.ts), que é `server-only`.

## Especificidades do Next 16 (diferem do que você provavelmente aprendeu)

| Mudança | O que fazer |
|---|---|
| `middleware.ts` → **`proxy.ts`** | O arquivo é [`src/proxy.ts`](src/proxy.ts) e a função exportada chama-se `proxy`. Runtime é sempre `nodejs`. |
| `params` / `searchParams` são **Promise** | Sempre `await`. O acesso síncrono foi removido (não é só deprecação). |
| `cookies()` / `headers()` são **async** | Sempre `await`. |
| Tipos de rota | Use `PageProps<'/users/[userId]'>` e `LayoutProps<'/'>`, gerados por `next typegen`. Não tipe props de página na mão. |
| `typedRoutes` ligado | `href` e `router.push` são validados. String em runtime precisa de `as Route` (importado de `next`). |
| `next lint` removido | Lint e formatação são do **Biome**, configurado na raiz do monorepo (`biome.json`). |
| Turbopack é padrão | Não passe `--turbopack`. |
| Regras do React Compiler | `setState` dentro de `useEffect` e funções impuras no render são proibidos (convenção — o Biome não checa). Use `useRef` ou `useSyncExternalStore`. |

## Scripts

Rode na raiz com `-w @triar-app/web` (ou dentro de `apps/web`). `lint`/`format` existem só na raiz.

| Comando | O que faz |
|---|---|
| `npm run dev` | Sobe o dev server (porta 3000). |
| `npm run typecheck` | Gera os tipos de rota e roda o `tsc`. |
| `npm run build` | Build de produção (valida a env e falha se faltar variável). |
| `npm run tests:ci` | Playwright headless. |
| `npm run tests:ui` | Playwright com interface. |

**Valide antes de commitar (na raiz):** `npm run lint && npm run typecheck && npm run build`.

## Ferramentas para agentes

O [`.mcp.json`](.mcp.json) registra o `next-devtools-mcp`. Com o dev server
rodando, ele expõe erros de compilação, rotas e logs do servidor sem precisar de
um `next build` completo.
