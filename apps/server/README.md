# triar-app — server

API do triar-app em **Fastify + Knex (PostgreSQL) + TypeScript**, seguindo o padrão arquitetural `routes → controllers → cases`. Acompanha validação de ambiente com Zod, tratamento de erros centralizado, Docker Compose e documentação Swagger.

## Requisitos

- Node.js 22+
- Docker + Docker Compose (para o PostgreSQL)

## Começando

```bash
# tudo na raiz do monorepo
# 1. Variáveis de ambiente
cp apps/server/.env.example apps/server/.env.local

# 2. Subir o PostgreSQL (docker-compose.yaml fica na raiz)
npm run db:up

# 3. Instalar dependências
npm install

# 4. Rodar em desenvolvimento (hot reload)
npm run dev -w @triar-app/server
```

Servidor em `http://localhost:4000`:

- `GET http://localhost:4000/health` → `{ "status": "ok", "uptime": <n>, "timestamp": "..." }`
- `http://localhost:4000/docs` → Swagger UI (somente em `NODE_ENV=development`)

## Scripts

Rode na raiz com `-w @triar-app/server` (ou dentro de `apps/server`).

```bash
npm run dev             # desenvolvimento com tsx watch
npm run build           # compila para dist/ com tsup
npm run start           # executa a build (node dist/server.js)
npm run typecheck       # tsc --noEmit
npm run test            # vitest (precisa do banco de teste, porta 5433)

npm run migrate:make -- <nome>   # cria migration
npm run migrate:latest        # aplica migrations pendentes
npm run migrate:rollback      # desfaz o último lote
npm run seed:make -- <nome>      # cria seed
npm run seed:run              # executa seeds
```

## Estrutura

```
src/
├── server.ts                 # entry point (listen)
├── app.ts                    # factory create_app() (plugins, rotas, error handler)
├── routes/                   # registro de rotas (agregadas em index.ts)
├── controllers/              # camada HTTP — valida com Zod e chama o case
├── cases/                    # regra de negócio + queries Knex
├── middlewares/              # error-handler-middleware
├── libs/                     # environments, connection (Knex), errors/app-errors
└── database/                 # config do Knex, migrations/, seeds/
```

O alias `~/` aponta para `src/`. Veja [CLAUDE.md](CLAUDE.md) para as convenções de código e o passo a passo de "como adicionar um endpoint".

## Variáveis de ambiente

| Variável        | Padrão                                               | Descrição                          |
| --------------- | ---------------------------------------------------- | ---------------------------------- |
| `NODE_ENV`      | `development`                                        | ambiente de execução               |
| `PORT`          | `4000`                                               | porta do servidor                  |
| `HOST`          | `0.0.0.0`                                            | host do servidor                   |
| `DATABASE_URL`  | `postgresql://docker:docker@localhost:5432/triar_app`         | string de conexão do PostgreSQL    |
| `ORIGINS`       | `http://localhost:3000`                              | origens permitidas no CORS (CSV)   |

## Produção (Docker)

O build usa a raiz do monorepo como contexto (o Dockerfile faz `turbo prune`):

```bash
docker build -t triar-app-server -f apps/server/Dockerfile .
docker run --env-file apps/server/.env.local -p 4000:4000 triar-app-server
```
