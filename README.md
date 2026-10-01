# triar-app

**Triar** — app de pré-triagem. A pessoa diz o que sente, o app classifica a urgência pelo Protocolo de Manchester (1 a 5) e indica para onde ir, no SUS ou no plano, terminando num cartão com QR code para mostrar na recepção.

Monorepo com **npm workspaces + Turborepo**:

| App | Pacote | Stack | Porta |
|---|---|---|---|
| [`apps/server`](apps/server) | `@triar-app/server` | Fastify + Knex (PostgreSQL) + Zod + OpenAI | 4000 |
| [`apps/web`](apps/web) | `@triar-app/web` | Next.js 16 + React 19 + TanStack Query + Tailwind v4 + Leaflet | 3000 |

Design e telas: [`docs/Triar-design-system.pdf`](docs/Triar-design-system.pdf) e [`docs/Triar-telas.pdf`](docs/Triar-telas.pdf). O que ficou para depois está em [`docs/pending.md`](docs/pending.md).

## Começando

Requisitos: Node.js 22+ e Docker.

```bash
npm install

cp apps/server/.env.example apps/server/.env.local   # coloque sua OPENAI_API_KEY
cp apps/web/.env.example apps/web/.env

npm run db:up            # PostgreSQL (dev :5432, teste :5433)
npm run migrate:latest
npm run seed:run         # unidades fictícias em Caruaru-PE + usuários da recepção
npm run start:dev        # sobe server e web juntos
```

Abra http://localhost:3000. A documentação da API (Swagger) fica em http://localhost:4000/docs.

### Variáveis do server (`apps/server/.env.local`)

| Variável | Para quê |
|---|---|
| `OPENAI_API_KEY` | Classificação por IA em `POST /api/triage`. Sem ela, a rota responde 503 — as regras de sinal grave continuam funcionando. |
| `OPENAI_MODEL` | Modelo da OpenAI (o `.env.example` sugere `gpt-5-mini`; troque pelo que preferir). |
| `SESSION_SECRET` | Assina o cookie de login da recepção. **Igual** ao `SESSION_SECRET` do web. |
| `CARD_SECRET` | Assina o token do cartão de triagem (QR). |

## Como funciona

| Tela | Rota (web) | API |
|---|---|---|
| Início — aviso, rede (SUS/plano), localização | `/` | — |
| Sintomas (1 de 3) | `/symptoms` | `GET /api/symptoms`, `POST /api/triage` (só regras) |
| Perguntas (2 de 3) | `/questions` | `POST /api/triage` (regras → IA) |
| Emergência — sinal grave, pula a IA | `/emergency` | — |
| Resultado — nível, explicação, sinais de alerta | `/result` | — |
| Unidades — mapa + lista por lotação e distância | `/units` | `GET /api/units` |
| Cartão de triagem — QR para a recepção | `/card` | `POST /api/cards` |
| Área da unidade — lotação ao vivo | `/signin`, `/unit` | `POST /api/sessions`, `PATCH /api/units/:id/occupancy` |

- **Regras antes da IA:** sinais graves (ex.: dor no peito + falta de ar, desmaio) levam direto à tela de Emergência, sem chamar o LLM.
- **LGPD:** nenhum dado de saúde é salvo em banco. O resumo da triagem vai dentro do token assinado do QR, e o estado do fluxo fica só no `sessionStorage` do aparelho.
- **Lotação ao vivo:** a recepção troca a lotação em `/unit`, e a lista de unidades dos pacientes se atualiza sozinha a cada 10 s.

### Usuários da recepção (seed)

Todos com a senha **`triar123`**:

| Telefone | Unidade |
|---|---|
| (81) 99000-0001 | Clínica Vida Plena (plano) |
| (81) 99000-0002 | Hospital Esperança Agreste (plano) |
| (81) 99000-0003 | Hospital Municipal do Agreste (SUS) |
| (81) 99000-0004 | Pronto-socorro Indianópolis (plano) |
| (81) 99000-0005 | Pronto-socorro Santa Clara (plano) |
| (81) 99000-0006 | UBS Centro (SUS) |
| (81) 99000-0007 | UBS Petrópolis (SUS) |
| (81) 99000-0008 | UBS São Francisco (SUS) |
| (81) 99000-0009 | UBS Universitário (SUS) |
| (81) 99000-0010 | UPA Boa Vista (SUS) |
| (81) 99000-0011 | UPA Salgado (SUS) |
| (81) 99000-0012 | UPA Vassoural (SUS) |

## Scripts (raiz)

| Comando | O que faz |
|---|---|
| `npm run start:dev` | `dev` de todas as apps (Turbo, em paralelo). |
| `npm run start:build` | Build de todas as apps (com cache do Turbo). |
| `npm run typecheck` | `tsc` em todas as apps. |
| `npm run test` | Testes e2e das rotas do server (Vitest, precisa do banco de teste em :5433). |
| `npm run lint` / `npm run format` | Biome: checa / corrige lint, formatação e imports. |
| `npm run db:up` | `docker compose up -d`. |
| `npm run migrate:latest` / `npm run seed:run` | Atalhos para os scripts do server. |

Para rodar algo em uma app só: `npm run <script> -w @triar-app/server` (ou `-w @triar-app/web`),
ou `npx turbo run <task> --filter=@triar-app/web`.

Para instalar uma dependência numa app: `npm install <pacote> -w @triar-app/web`.

O front não tem testes automatizados: é testado manualmente.

## Docker (server)

```bash
docker build -t triar-app-server -f apps/server/Dockerfile .
```
