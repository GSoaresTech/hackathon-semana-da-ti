# triar-app

Monorepo com **npm workspaces + Turborepo**.

| App | Pacote | Stack | Porta |
|---|---|---|---|
| [`apps/server`](apps/server) | `@triar-app/server` | Fastify + Knex (PostgreSQL) + Zod | 4000 |
| [`apps/web`](apps/web) | `@triar-app/web` | Next.js 16 + React 19 + TanStack Query + shadcn/ui | 3000 |

## Começando

Requisitos: Node.js 22+ e Docker.

```bash
npm install

cp apps/server/.env.example apps/server/.env.local
cp apps/web/.env.example apps/web/.env

npm run db:up            # PostgreSQL (dev :5432, teste :5433)
npm run migrate:latest
npm run dev              # sobe server e web juntos
```

## Scripts (raiz)

| Comando | O que faz |
|---|---|
| `npm run dev` | `dev` de todas as apps (Turbo, em paralelo). |
| `npm run build` | Build de todas as apps (com cache do Turbo). |
| `npm run typecheck` | `tsc` em todas as apps. |
| `npm run test` | Testes do server (Vitest, precisa do banco de teste). |
| `npm run test:e2e` | Playwright do web. |
| `npm run lint` / `npm run format` | Biome: checa / corrige lint, formatação e imports. |
| `npm run db:up` | `docker compose up -d`. |
| `npm run migrate:latest` / `npm run seed:run` | Atalhos para os scripts do server. |

Para rodar algo em uma app só: `npm run <script> -w @triar-app/server` (ou `-w @triar-app/web`),
ou `npx turbo run <task> --filter=@triar-app/web`.

Para instalar uma dependência numa app: `npm install <pacote> -w @triar-app/web`.

## Docker (server)

```bash
docker build -t triar-app-server -f apps/server/Dockerfile .
```
