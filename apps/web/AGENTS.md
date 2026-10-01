<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Instruções do projeto

> O bloco acima é gerenciado pelo `next dev`. **Não edite nada entre os
> marcadores `BEGIN`/`END`** — ele é reescrito automaticamente. Regras do
> projeto vão daqui para baixo.

Este é o front-end do **Triar**, um app de pré-triagem mobile-first: a pessoa
diz o que sente, o app classifica a urgência pelo Protocolo de Manchester
(níveis 1 a 5) e mostra para onde ir — no SUS ou no plano. O código existente
é a referência: antes de criar um padrão novo, procure um equivalente já
pronto e siga-o.

## Regra de ouro

**Padrão existente no repositório vence preferência pessoal.** Se já existe uma
tela, componente ou serviço parecido com o que você vai escrever, copie a
estrutura dele. Consistência aqui vale mais do que elegância pontual.

## Design

Toda interface segue o **design system Triar v1**. As fontes da verdade são
[`docs/Triar-design-system.pdf`](../../docs/Triar-design-system.pdf) e
[`docs/Triar-telas.pdf`](../../docs/Triar-telas.pdf), na raiz do monorepo (leia
com a ferramenta de PDF). O resumo — tokens, componentes, telas e princípios —
está em [`docs/design-system.md`](docs/design-system.md). Leia antes de mexer
em qualquer tela.

Em uma linha: uma decisão por tela; "Emergência 192" em todas as telas; cor
nunca sozinha; nunca "você tem…", sempre "seus sintomas indicam…"; só tokens
do `globals.css`; dado de saúde nunca vai para banco.

## Stack

| Camada | Escolha |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) + React 19.2 |
| Linguagem | TypeScript `strict` |
| Estilo | Tailwind CSS v4 (CSS-first, **sem** `tailwind.config.js`) + shadcn/ui sobre Radix |
| Estado de servidor | TanStack Query v5 |
| Estado do fluxo | Zustand v5 (`persist` em `sessionStorage`) |
| Formulários | React Hook Form + Zod **v4** |
| HTTP | Axios (instância única em `~/libs/api`) |
| Mapa | Leaflet + react-leaflet (OpenStreetMap) |
| QR code | qrcode.react (+ html-to-image para salvar o cartão) |
| Notificações | Sonner (`toast`) |
| Datas | dayjs (via `~/libs/dayjs`) |
| Máscaras | Maskito |
| Lint/format | Biome (na raiz do monorepo) |

## Antes de escrever código

1. Leia o guia relevante em `node_modules/next/dist/docs/` (ver bloco acima).
2. Leia o documento correspondente em [`docs/`](docs/) — são curtos e mostram
   o padrão com código real deste repositório:
   - [`docs/design-system.md`](docs/design-system.md) — tokens, componentes, telas e princípios
   - [`docs/arquitetura.md`](docs/arquitetura.md) — estrutura de pastas e o que vai onde
   - [`docs/convencoes.md`](docs/convencoes.md) — nomes, idioma, exports, imports
   - [`docs/dados.md`](docs/dados.md) — axios, services e TanStack Query
   - [`docs/formularios.md`](docs/formularios.md) — React Hook Form + Zod
   - [`docs/estado.md`](docs/estado.md) — Zustand e o store da triagem
   - [`docs/componentes.md`](docs/componentes.md) — padrão de subcomponentes, shadcn, a11y
   - [`docs/autenticacao.md`](docs/autenticacao.md) — login da recepção e `proxy.ts`
3. O que ficou fora do MVP (como o painel da unidade, tela 08) está em
   [`docs/pending.md`](../../docs/pending.md), na raiz do monorepo.

## Regras inegociáveis

### Nomenclatura e idioma

- **Arquivos e pastas:** `kebab-case`, sempre. `units-view.tsx`,
  `triage-store.ts`, `use-geolocation.ts`.
- **Código:** `camelCase` para variáveis, propriedades e funções; `PascalCase`
  para componentes e tipos; `SCREAMING_SNAKE_CASE` para constantes de módulo.
- **Tudo que é código é inglês:** identificadores, propriedades da API, valores
  de enum (`'public'`, `'low'`), caminhos da API (`/api/units`) e URLs de
  página (`/symptoms`, `/result`). **Texto de interface, prompts de IA e
  comentários são em português.**
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
- **Todo formulário com envio** usa `react-hook-form` + `zod` +
  `@hookform/resolvers/zod` (referência:
  [`signin-form.tsx`](src/components/forms/signin-form.tsx)). Os passos da
  triagem são a exceção: escrevem direto no store.
- **Dado de servidor** mora no TanStack Query; **estado do fluxo** (rede,
  sintomas, respostas, resultado) mora no Zustand
  ([`triage-store.ts`](<src/app/(triage)/triage-store.ts>)). Não duplique um
  no outro.
- Rótulos de domínio (níveis, rede, lotação, tipos de unidade) vêm de
  [`src/libs/constants.ts`](src/libs/constants.ts). Não escreva "Urgente" ou
  "SUS" solto num componente.

### Estilo

- Sempre `cn()` de `~/libs/utils` para juntar classes.
- **Só tokens do design system** (`bg-brand-600`, `text-ink-muted`,
  `text-title`, `rounded-lg`, `shadow-card`). Nunca cor fixa nem paleta padrão
  do Tailwind. Só tema claro: sem `dark:`.
- Alvo de toque com no mínimo 48px. Nada pisca; transições de 150ms.

### Erros

- Não use `try/catch` em componente. O interceptor do axios já normaliza
  qualquer falha em `Error` com mensagem pronta para o usuário.
- Feedback de mutação é `toast.promise(promise, { loading, success, error: (e) => e.message })`
  nos formulários, ou `onError: (error) => toast.error(error.message)` nos
  passos do fluxo.

### Segurança e privacidade

- `proxy.ts` é **UX**, não autorização. Ele só protege `/unit/**`; quem autoriza
  é o backend.
- Segredo nunca em `NEXT_PUBLIC_*`. Variável privada vai em
  [`src/libs/env.server.ts`](src/libs/env.server.ts), que é `server-only`.
- **LGPD:** dado de saúde fica só no `sessionStorage` (store da triagem) e
  dentro do token do QR. Nada é salvo em banco, nada vai para `localStorage`.

## Especificidades do Next 16 (diferem do que você provavelmente aprendeu)

| Mudança | O que fazer |
|---|---|
| `middleware.ts` → **`proxy.ts`** | O arquivo é [`src/proxy.ts`](src/proxy.ts) e a função exportada chama-se `proxy`. Runtime é sempre `nodejs`. |
| `params` / `searchParams` são **Promise** | Sempre `await`. O acesso síncrono foi removido (não é só deprecação). |
| `cookies()` / `headers()` são **async** | Sempre `await`. |
| Tipos de rota | Use `PageProps<'/units'>` e `LayoutProps<'/'>`, gerados por `next typegen`. Não tipe props de página na mão. |
| `typedRoutes` ligado | `href` e `router.push` são validados. String em runtime precisa de `as Route` (importado de `next`). |
| `next lint` removido | Lint e formatação são do **Biome**, configurado na raiz do monorepo (`biome.json`). Não há ESLint. |
| Turbopack é padrão | Não passe `--turbopack`. |
| Regras do React Compiler | `setState` dentro de `useEffect` e funções impuras no render são proibidos (convenção — o Biome não checa). Use `useRef` ou `useSyncExternalStore`. |

## Scripts

Na raiz do monorepo:

| Comando | O que faz |
|---|---|
| `npm run start:dev` | Sobe web (porta 3000) e server juntos (turbo). |
| `npm run start:build` | Build de produção de todos os apps. |
| `npm run typecheck` | Typecheck de todos os apps. |
| `npm run lint` / `npm run format` | Biome (checa / corrige). |
| `npm run test` | Testes — só do server. |

Só o web: `npm run <script> -w @triar-app/web`, com `dev`, `build`, `start`,
`typecheck` (gera os tipos de rota e roda o `tsc`) e `typegen`.

**Não há testes automatizados no front**: as telas são testadas manualmente,
no celular ou no modo responsivo do navegador.

**Valide antes de commitar (na raiz):** `npm run lint && npm run typecheck && npm run start:build`.

## Ferramentas para agentes

O [`.mcp.json`](../../.mcp.json) na raiz do monorepo registra o
`next-devtools-mcp`. Com o dev server rodando, ele expõe erros de compilação,
rotas e logs do servidor sem precisar de um `next build` completo.
