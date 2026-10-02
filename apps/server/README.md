# triar-app — server

API do Triar em **Fastify + Knex (PostgreSQL) + TypeScript**, seguindo o padrão arquitetural `routes → controllers → cases`. Faz a pré-triagem (regras de sinal grave + classificação por IA via OpenAI), lista as unidades por lotação e distância, gera o cartão de triagem (token assinado) e cuida do login da recepção.

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

- `http://localhost:4000/docs` → Swagger UI (somente em `NODE_ENV=development`)

## Rotas

Todas sob o prefixo `/api`. 🔒 = exige o cookie de sessão da recepção (`POST /api/sessions`).

| Rota | O que faz |
|---|---|
| `GET /health` | Health check (inclui o status do banco). |
| `GET /symptoms` | Sintomas pré-definidos e as perguntas que cada um ativa. |
| `POST /triage` | Regras de sinal grave → se nada for grave e vierem `answers`, a IA classifica o nível (2–5) e devolve `result_token` (JWT, 12 h). Falha da IA → 503. |
| `GET /units?level=&network=&lat=&lng=` | Unidades indicadas para o nível e a rede, por lotação e distância, com `notice`. |
| `PATCH /units/:id/occupancy` 🔒 | Lotação da unidade do usuário logado (demo). |
| `POST /cards` | Gera o cartão a partir de `{ result_token, destination }`. O `destination` carrega `{ id, name, travel_minutes }` (minutos até a unidade, opcional). O resumo é montado pelo server e devolvido junto do JWT do cartão (12 h). Nada é salvo em banco. |
| `GET /cards/:token` 🔒 | Lê o resumo de um cartão. Token inválido ou expirado → 400. |
| `POST /sessions` / `DELETE /sessions` | Login por telefone + senha (cookie httpOnly `token`) / logout. |
| `GET /sessions/me` 🔒 | Usuário logado e a unidade dele. |

Os usuários e unidades do seed (fictícios, Caruaru-PE) estão no README da raiz.

## Scripts

Rode na raiz com `-w @triar-app/server` (ou dentro de `apps/server`).

```bash
npm run dev             # desenvolvimento com tsx watch
npm run build           # compila para dist/ com tsup
npm run start           # executa a build (node dist/server.js)
npm run typecheck       # tsc --noEmit
npm run test            # vitest (precisa do banco de teste, porta 5441)

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
├── middlewares/              # error-handler, protected-route (sessão)
├── libs/                     # environments, connection, errors, ai (OpenAI), tokens (JWT), hash, geo
├── @types/                   # augment do FastifyRequest (request.user)
└── database/                 # config do Knex, migrations/, seeds/
```

O alias `~/` aponta para `src/`. Veja [CLAUDE.md](CLAUDE.md) para as convenções de código e o passo a passo de "como adicionar um endpoint".

## Variáveis de ambiente

| Variável        | Padrão                                               | Descrição                          |
| --------------- | ---------------------------------------------------- | ---------------------------------- |
| `NODE_ENV`      | `development`                                        | ambiente de execução               |
| `PORT`          | `4000`                                               | porta do servidor                  |
| `HOST`          | `0.0.0.0`                                            | host do servidor                   |
| `DATABASE_URL`  | `postgresql://docker:docker@localhost:5440/triar_app`         | string de conexão do PostgreSQL    |
| `ORIGINS`       | `http://localhost:3000`                              | origens permitidas no CORS (CSV)   |
| `SESSION_SECRET` | —                                                   | assina o cookie de sessão (igual ao do web, mín. 16) |
| `CARD_SECRET`   | —                                                    | assina o token do cartão de triagem (mín. 16) |
| `OPENAI_API_KEY` | —                                                   | chave da OpenAI; sem ela `POST /triage` responde 503 |
| `OPENAI_MODEL`  | `gpt-5-mini` (no `.env.example`)                     | modelo usado na classificação      |

## Produção (Docker)

O build usa a raiz do monorepo como contexto (o Dockerfile faz `turbo prune`):

```bash
docker build -t triar-app-server -f apps/server/Dockerfile .
docker run --env-file apps/server/.env.local -p 4000:4000 triar-app-server
```
