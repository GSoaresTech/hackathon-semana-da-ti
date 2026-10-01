# Template de aplicação web

Template da equipe para novas aplicações web: Next.js 16 (App Router) + React
19, TanStack Query, Zustand, React Hook Form + Zod v4, Axios e shadcn/ui sobre
Tailwind v4.

Vem com autenticação funcional, um CRUD de referência e documentação escrita
para pessoas e para agentes de IA.

## Começando

```bash
# na raiz do monorepo
npm install
cp apps/web/.env.example apps/web/.env    # ajuste os valores
npm run dev -w @triar-app/web
```

O `.env` precisa de:

| Variável | Para quê |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base do axios no browser. Deixe `/api`. |
| `PRIVATE_API_URL` | URL absoluta do backend. Alimenta o rewrite. |
| `SESSION_SECRET` | **O mesmo `SECRET` do backend**, para verificar o JWT. |

A env é validada com Zod no `next.config.ts`: se faltar variável, o build falha
listando o que está errado.

## Scripts

Rode na raiz com `-w @triar-app/web` (ou dentro de `apps/web`).

| Comando | O que faz |
|---|---|
| `npm run dev` | Dev server na porta 3000. |
| `npm run build` | Build de produção. |
| `npm run typecheck` | Gera os tipos de rota e roda o `tsc`. |
| `npm run tests:ci` | Playwright headless. |
| `npm run tests:ui` | Playwright com interface. |

Lint e formatação são do Biome, na raiz do monorepo (`npm run lint` / `npm run format`).

Antes de commitar (na raiz): `npm run lint && npm run typecheck && npm run build`.

## Como usar como template

1. Clone e renomeie o projeto no `package.json`.
2. Ajuste os papéis em [`src/libs/constants.ts`](src/libs/constants.ts) para o
   seu domínio.
3. Ajuste a navegação em [`src/libs/pages.ts`](src/libs/pages.ts) — é ela que
   alimenta a sidebar **e** a proteção de rotas.
4. Copie a pasta [`src/app/(private)/(dashboard)/users/`](<src/app/(private)/(dashboard)/users/>)
   como molde para o primeiro CRUD e apague a de exemplo.
5. Confira [`src/services/sessions.ts`](src/services/sessions.ts) contra o
   contrato do seu backend.

## O CRUD de referência

`/users` demonstra, com código real, tudo que o template propõe:

- listagem com busca, filtros, paginação e chips de filtro ativo;
- `page.tsx` como Server Component compondo filhos client;
- store Zustand para filtros, TanStack Query para os dados;
- formulários de criação e edição com React Hook Form + Zod;
- detalhe com `DataContainer` / `DataField`;
- `loading.tsx` e estados de skeleton.

## Documentação

Comece pelo [`AGENTS.md`](AGENTS.md) — é o índice das regras e o arquivo que os
agentes de IA leem primeiro.

| Documento | Assunto |
|---|---|
| [`docs/arquitetura.md`](docs/arquitetura.md) | Estrutura de pastas, camadas, env |
| [`docs/convencoes.md`](docs/convencoes.md) | Nomes, exports, imports, tipos |
| [`docs/dados.md`](docs/dados.md) | Axios, services, TanStack Query |
| [`docs/formularios.md`](docs/formularios.md) | React Hook Form + Zod v4 |
| [`docs/estado.md`](docs/estado.md) | Zustand e a divisão de estado |
| [`docs/componentes.md`](docs/componentes.md) | Padrão de subcomponentes, shadcn |
| [`docs/autenticacao.md`](docs/autenticacao.md) | Sessão, `proxy.ts`, guards, papéis |

## Notas sobre o Next 16

Mudou bastante em relação ao 15:

- `middleware.ts` virou **`proxy.ts`** (export nomeado `proxy`, runtime `nodejs`).
- `params`, `searchParams`, `cookies()` e `headers()` são **sempre assíncronos**.
- Tipos de página vêm do `next typegen`: `PageProps<'/users/[userId]'>`.
- `typedRoutes` está ligado — `href` é validado em tempo de compilação.
- Turbopack é o padrão; `next lint` não existe mais.
- Siga as regras do React Compiler: nada de `setState` em efeito (o Biome não as checa — é convenção).

O [`.mcp.json`](../../.mcp.json) (na raiz do monorepo) registra o `next-devtools-mcp`, que dá aos agentes
acesso a erros de compilação e logs do dev server em tempo real.
