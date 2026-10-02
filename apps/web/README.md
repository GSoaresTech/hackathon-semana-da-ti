# triar-app — web

Front-end do **Triar**: app de pré-triagem mobile-first. A pessoa diz o que
sente, o app classifica a urgência pelo Protocolo de Manchester (níveis 1 a 5)
e mostra para onde ir — no SUS ou no plano. O app orienta e encaminha; não é
diagnóstico.

Next.js 16 (App Router) + React 19, TanStack Query, Zustand, React Hook Form +
Zod v4, Axios, Leaflet e shadcn/ui sobre Tailwind v4, seguindo o design system
Triar v1.

## Começando

Tudo roda a partir da **raiz do monorepo**:

```bash
npm install
cp apps/web/.env.example apps/web/.env    # ajuste os valores
npm run start:dev                         # sobe web (porta 3000) e server
```

O server precisa do banco e do seed antes (`npm run db:up`,
`npm run migrate:latest`, `npm run seed:run`) — o passo a passo completo e os
usuários de teste da recepção estão no [`instructions.md` da raiz](../../instructions.md).

Para subir só o web: `npm run dev -w @triar-app/web` (o backend precisa estar
rodando em `PRIVATE_API_URL`).

O `apps/web/.env` precisa de:

| Variável | Para quê |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base do axios no browser. Deixe `/api`. |
| `PRIVATE_API_URL` | URL absoluta do backend (ex.: `http://localhost:4000/api`). Alimenta o rewrite. |
| `SESSION_SECRET` | **O mesmo `SESSION_SECRET` do server**, para verificar o JWT da recepção. |
| `NEXT_PUBLIC_FILES_API_URL` | CDN de arquivos. Opcional. |

A env é validada com Zod no `next.config.ts`: se faltar variável, o build falha
listando o que está errado.

## Scripts

Na raiz do monorepo:

| Comando | O que faz |
|---|---|
| `npm run start:dev` | Dev de todos os apps (turbo). |
| `npm run start:build` | Build de produção de todos os apps. |
| `npm run typecheck` | Typecheck de todos os apps. |
| `npm run lint` / `npm run format` | Biome: checa / corrige lint e formatação. |
| `npm run test` | Testes automatizados — só do server. |

Só o web, com `npm run <script> -w @triar-app/web`:

| Script | O que faz |
|---|---|
| `dev` | Dev server na porta 3000. |
| `build` | Build de produção. |
| `start` | Serve o build. |
| `typecheck` | Gera os tipos de rota e roda o `tsc`. |
| `typegen` | Só gera os tipos de rota (`PageProps`, `LayoutProps`). |

O front não tem testes automatizados: as telas são testadas manualmente, no
celular ou no modo responsivo do navegador.

Antes de commitar (na raiz): `npm run lint && npm run typecheck && npm run start:build`.

## Telas

Fluxo do paciente (anônimo, em `src/app/(triage)/`):

| # | Tela | Rota |
|---|---|---|
| 01 | Início — aviso legal, rede (SUS/plano), localização | `/` |
| 02 | Sintomas (1 de 3) — chips e relato livre | `/symptoms` |
| 03 | Perguntas (2 de 3) — início, intensidade, idade, gestação | `/questions` |
| 04 | Emergência — sinal grave, "Ligue 192 agora" | `/emergency` |
| 05 | Resultado — nível, explicação, o que fazer | `/result` |
| 06 | Unidades — mapa e lista por lotação e distância | `/units` |
| 07 | Cartão de triagem (3 de 3) — QR para a recepção | `/card` |

Recepção das unidades (em `src/app/(unit)/`):

| Tela | Rota |
|---|---|
| Login por telefone + senha | `/signin` |
| Lotação da unidade (Tranquila / Moderada / Lotada) | `/unit` |
| Logout | `/signout` |

O painel da unidade (tela 08, leitura do QR na recepção) ainda não foi
implementado — ver [`docs/pending.md`](../../docs/pending.md) na raiz.

## Documentação

Comece pelo [`AGENTS.md`](AGENTS.md) — é o índice das regras e o arquivo que os
agentes de IA leem primeiro.

| Documento | Assunto |
|---|---|
| [`docs/design-system.md`](docs/design-system.md) | Tokens, componentes, telas e princípios do design |
| [`docs/arquitetura.md`](docs/arquitetura.md) | Estrutura de pastas, camadas, env |
| [`docs/convencoes.md`](docs/convencoes.md) | Nomes, idioma, exports, imports, estilo |
| [`docs/dados.md`](docs/dados.md) | Axios, services, TanStack Query |
| [`docs/formularios.md`](docs/formularios.md) | React Hook Form + Zod v4 |
| [`docs/estado.md`](docs/estado.md) | Zustand, o store da triagem e `sessionStorage` |
| [`docs/componentes.md`](docs/componentes.md) | Padrão de subcomponentes, shadcn, acessibilidade |
| [`docs/autenticacao.md`](docs/autenticacao.md) | Login da recepção, `proxy.ts`, sessão |

As fontes da verdade do design são
[`Triar-design-system.pdf`](../../docs/Triar-design-system.pdf) e
[`Triar-telas.pdf`](../../docs/Triar-telas.pdf), em `docs/` na raiz.

## Notas sobre o Next 16

Mudou bastante em relação ao 15:

- `middleware.ts` virou **`proxy.ts`** (export nomeado `proxy`, runtime `nodejs`).
- `params`, `searchParams`, `cookies()` e `headers()` são **sempre assíncronos**.
- Tipos de página vêm do `next typegen`: `PageProps<'/units'>`.
- `typedRoutes` está ligado — `href` é validado em tempo de compilação.
- Turbopack é o padrão; `next lint` não existe mais (lint é do Biome).
- Siga as regras do React Compiler: nada de `setState` em efeito (o Biome não as checa — é convenção).

O [`.mcp.json`](../../.mcp.json) (na raiz do monorepo) registra o `next-devtools-mcp`, que dá aos agentes
acesso a erros de compilação e logs do dev server em tempo real.
