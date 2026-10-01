# CLAUDE.md

Este arquivo orienta o Claude Code (e qualquer agente de IA) ao trabalhar neste repositório. **Siga estas regras rigorosamente.** O padrão existente no repositório SEMPRE supera preferências pessoais do agente.

## Stack

- **Servidor:** Node.js + Fastify (v4)
- **Linguagem:** TypeScript
- **Banco de dados:** PostgreSQL via query builder `Knex.js`
- **Validação:** Zod
- **Docs:** Swagger / OpenAPI (`@fastify/swagger` + `swagger-ui`), disponível em `/docs` no ambiente de desenvolvimento

O alias `~/` aponta para `src/` (configurado em `tsconfig.json`). Resolvido em runtime pelo `tsx` (dev e CLI do Knex) e no build pelo `tsup` — não há `tsconfig-paths`/`tsc-alias`.

## Comandos

Este app faz parte do monorepo `triar-app` (npm workspaces + Turborepo). Rode na raiz com `-w @triar-app/server` ou dentro de `apps/server`. Lint/formatação: Biome, na raiz (`npm run lint`).

```bash
npm run dev             # Servidor em desenvolvimento com hot reload (tsx watch)
npm run build           # Compila para dist/ com tsup
npm run start           # Executa a build de produção (node dist/server.js)
npm run typecheck       # tsc --noEmit
npm run test            # Vitest (banco de teste na porta 5433, ver docker-compose.yaml da raiz)

# Banco de dados (Knex)
npm run migrate:make -- <nome>   # Cria um novo arquivo de migration (.ts)
npm run migrate:latest        # Aplica todas as migrations pendentes
npm run migrate:rollback      # Desfaz o último lote de migrations
npm run seed:make -- <nome>      # Cria um novo arquivo de seed
npm run seed:run              # Executa os seeds
```

## Arquitetura

**Fluxo da requisição:** `routes/ → controllers/ → cases/ → banco via connection`

Nenhuma regra de negócio fica nas rotas ou nos controllers. **Toda query Knex vive estritamente na camada `cases/`.**

- **`src/cases/`** — Lógica de negócio. Funções `async` puras com input/output tipados. Importam `connection` de `~/libs/connection` e lançam erros de `~/libs/errors/app-errors`. É a única camada que acessa o banco.
- **`src/controllers/`** — Apenas camada HTTP. Recebem `FastifyRequest`/`FastifyReply`, validam a entrada com Zod (`z.object({...}).parse(request.body)`), chamam um `case` e retornam a resposta. Middlewares/schema são anexados via a propriedade `.options` do controller.
- **`src/routes/`** — Registram os controllers em paths do Fastify. Cada módulo é uma função `async function entity_routes(app: FastifyInstance)`. O agregador `routes/index.ts` (`app_routes`) registra todos os módulos.
- **`src/middlewares/`** — `error-handler-middleware` mapeia `AppError`/`ZodError` para respostas HTTP.
- **`src/libs/`** — Utilitários: `environments` (env validado por Zod, fail-fast), `connection` (singleton do Knex), `errors/app-errors` (hierarquia de erros).
- **`src/database/`** — `config.ts` (config do Knex por ambiente, usa `DATABASE_URL`), `migrations/` e `seeds/`.
- **`src/app.ts`** — Factory `create_app()`: cria a instância Fastify, registra cors, swagger (só em dev), as rotas e o error handler.
- **`src/server.ts`** — Entry point: chama `create_app()` e faz `listen()`.

## Convenções obrigatórias

- **Nomes de arquivo:** `kebab-case` (ex.: `create-user-controller.ts`).
- **Identificadores:** `snake_case` para variáveis, funções, propriedades e colunas (ex.: `create_user_case`, `user_id`). Não use `camelCase`.
- **Exportações:** Não use `export default`. Exporte nomeado ao final do arquivo: `export { nome_da_funcao }`.
- **Imports internos:** Sempre via alias `~/...` (ex.: `~/cases/...`, `~/libs/...`).
- **Tipagem:** Evite `any` e supressões do TypeScript salvo extrema necessidade.
- **Erros:** Lance as classes de `~/libs/errors/app-errors` (`NotFoundError`, `AlreadyExistsError`, `ForbiddenError`, `BadRequestError`, ...). O error handler global converte em status HTTP.
- **Validação:** Ocorre exclusivamente na camada de controller, com Zod.

## Como adicionar um endpoint

1. Crie `src/cases/<dominio>/<acao>-case.ts` com `type <Acao>CaseInput`/`Output` e a regra de negócio (queries Knex aqui).
2. Crie `src/controllers/<dominio>/<acao>-controller.ts` validando com Zod e chamando o case. Se a rota precisar de middlewares/schema, exporte `<acao>_controller.options`.
3. Crie/edite `src/routes/<dominio>-routes.ts` registrando o controller (`app.get('/caminho', controller.options, controller)`) e registre o módulo em `src/routes/index.ts`.

> Referência viva: a rota `GET /health` (`routes/health-routes.ts` → `controllers/health/health-controller.ts` → `cases/health/health-case.ts`) implementa exatamente esse fluxo.

## Práticas finais

- Não introduza lógica redundante; reaproveite utilitários existentes em `~/libs`.
- Rode `npm run build` e `npm run lint` (na raiz) antes de considerar uma tarefa concluída.
- Mantenha a arquitetura e a nomenclatura existentes — não as altere se já houver lógica parecida no repositório.