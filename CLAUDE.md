# CLAUDE.md

Monorepo `triar-app` — **npm workspaces + Turborepo**. Cada app tem seu próprio guia, que vale para o código dentro dela:

- [`apps/server/CLAUDE.md`](apps/server/CLAUDE.md) — API Fastify + Knex (`@triar-app/server`)
- [`apps/web/AGENTS.md`](apps/web/AGENTS.md) — Next.js 16 (`@triar-app/web`)

## Regras do monorepo

- Um único `package-lock.json` na raiz. Instale dependências com `npm install <pacote> -w @triar-app/<app>`; nunca rode `npm install` dentro de uma app.
- O `node_modules` fica na raiz (hoisted). Docs do Next: `node_modules/next/dist/docs/`.
- Lint, formatação e ordenação de imports são do **Biome** (`biome.json` na raiz). Não existe ESLint/Prettier.
- Tasks orquestradas pelo Turbo (`turbo.json`): `dev`, `build`, `typecheck`, `test`. Os scripts das apps devem manter esses nomes.
- Se uma variável de ambiente nova afetar o build, declare-a em `env` no `turbo.json` (o Turbo roda em strict mode).

## Comandos (raiz)

```bash
npm run dev          # server (:4000) + web (:3000)
npm run build
npm run typecheck
npm run lint         # biome check
npm run format       # biome check --write
npm run test         # vitest do server (banco de teste :5433)
npm run test:e2e     # playwright do web
npm run db:up        # docker compose up -d
```

Antes de considerar uma tarefa concluída: `npm run lint && npm run typecheck && npm run build`.

@AGENTS.md
