# CLAUDE.md

Monorepo `triar-app` — **npm workspaces + Turborepo**. Triar é um app de pré-triagem (Protocolo de Manchester → para onde ir, no SUS ou no plano). Design e telas em `docs/*.pdf`; pendências em `docs/pending.md`.

Cada app tem seu próprio guia, que vale para o código dentro dela:

- [`apps/server/CLAUDE.md`](apps/server/CLAUDE.md) — API Fastify + Knex (`@triar-app/server`)
- [`apps/web/AGENTS.md`](apps/web/AGENTS.md) — Next.js 16 (`@triar-app/web`)

## Regras do monorepo

- Um único `package-lock.json` na raiz. Instale dependências com `npm install <pacote> -w @triar-app/<app>`; nunca rode `npm install` dentro de uma app.
- O `node_modules` fica na raiz (hoisted). Docs do Next: `node_modules/next/dist/docs/`.
- Lint, formatação e ordenação de imports são do **Biome** (`biome.json` na raiz). Não existe ESLint/Prettier.
- Tasks orquestradas pelo Turbo (`turbo.json`): `dev`, `build`, `typecheck`, `test`. Os scripts das apps devem manter esses nomes.
- Se uma variável de ambiente nova afetar o build, declare-a em `env` no `turbo.json` (o Turbo roda em strict mode).
- **Idioma:** tudo o que é código fica em inglês — identificadores, propriedades da API, tabelas/colunas, valores de enum, caminhos da API e URLs das páginas. Textos de tela, prompts da IA e comentários ficam em português.
- **LGPD:** nenhum dado de saúde vai para o banco. O resumo da triagem viaja só no token assinado do cartão (QR).
- Testes automatizados só no server (e2e de rota com supertest). O front é testado manualmente.

## Comandos (raiz)

```bash
npm run start:dev    # server (:4000) + web (:3000)
npm run start:build
npm run typecheck
npm run lint         # biome check
npm run format       # biome check --write
npm run test         # vitest do server (banco de teste :5441)
npm run db:up        # docker compose up -d
npm run migrate:latest && npm run seed:run
```

Antes de considerar uma tarefa concluída: `npm run lint && npm run typecheck && npm run start:build` (e `npm test` se mexeu no server).

@AGENTS.md
