# Arquitetura

## Ideia central

O web é um **front-end que conversa com a API REST do monorepo**
(`apps/server`). O Next serve a interface e faz o proxy do backend; ele não é o
dono dos dados.

```
browser ──/api/*──> Next (rewrite) ──> backend (apps/server)
   │                   │
   │                   └─ proxy.ts: verifica o cookie de sessão em /unit
   └─ axios (~/libs/api): camelCase ⇄ snake_case, cookie httpOnly
```

Por que o rewrite existe: com `NEXT_PUBLIC_API_URL="/api"`, o browser só fala
com a própria origem. O cookie de sessão da recepção continua **first-party**,
sem CORS e sem token em JavaScript. Trocar isso por uma URL absoluta do backend
quebraria o modelo de autenticação.

## Estrutura de pastas

```
src/
├─ app/
│  ├─ (triage)/             fluxo anônimo do paciente (telas 01–07)
│  │  ├─ page.tsx           /  (Início) + start-form.tsx
│  │  ├─ symptoms/          /symptoms
│  │  ├─ questions/         /questions
│  │  ├─ emergency/         /emergency
│  │  ├─ result/            /result
│  │  ├─ units/             /units (mapa + lista)
│  │  ├─ card/              /card (cartão com QR)
│  │  ├─ triage-store.ts    Zustand do fluxo (sessionStorage)
│  │  └─ use-triage-guard.ts
│  ├─ (unit)/               área da recepção
│  │  ├─ signin/            /signin
│  │  ├─ unit/              /unit (lotação) — protegida pelo proxy.ts
│  │  └─ signout/           /signout
│  ├─ layout.tsx            fonte, QueryClientProvider, Toaster
│  ├─ globals.css           tokens do design system (@theme)
│  ├─ error.tsx, global-error.tsx, not-found.tsx
│  └─ favicon.ico
├─ components/
│  ├─ ui/                   primitivas shadcn ajustadas ao design system
│  ├─ forms/                formulários (signin-form.tsx)
│  └─ <familia>/index.tsx   brand, screen, emergency-button, unit-card,
│                           units-map, triage-card… (ver design-system.md)
├─ hooks/                   use-geolocation.ts
├─ libs/                    api, env*, session, queries, constants,
│                           formatters, mask, dayjs, utils
├─ providers/               query-client-provider.tsx
├─ services/                um arquivo por recurso: symptoms, triage,
│                           units, cards, sessions
└─ proxy.ts                 antigo middleware.ts (ver autenticacao.md)
```

## Onde colocar o código de uma tela

**Colocation:** tudo que só a tela usa mora na pasta da rota. Só sobe para
`components/` o que for reaproveitado por mais de uma rota — ou o que é peça do
design system.

```
app/(triage)/units/
├─ page.tsx          Server Component: metadata + lê searchParams
└─ units-view.tsx    'use client': store, useQuery, mapa e lista
```

Os arquivos são **prefixados com o nome da tela** (`units-view.tsx`,
`symptoms-form.tsx`, `unit-occupancy.tsx`), não `view.tsx`. Com várias telas
abertas no editor, abas escritas `view.tsx` são indistinguíveis.

Estado compartilhado por várias telas do mesmo grupo sobe para a pasta do
grupo: `app/(triage)/triage-store.ts` e `app/(triage)/use-triage-guard.ts` são
usados por todas as telas do fluxo e por nenhuma outra.

## Grupos de rota

```
app/
├─ (triage)/   paciente, anônimo: /, /symptoms, /questions, /emergency,
│              /result, /units, /card
└─ (unit)/     recepção: /signin, /unit, /signout
```

Parênteses não entram na URL — servem para agrupar rotas e colocar código
compartilhado ao lado delas. Nenhum dos dois grupos tem `layout.tsx` próprio:
cada tela monta seu esqueleto com `Screen` (ver
[`componentes.md`](componentes.md)).

> Estar dentro de `(unit)/` **não protege** a rota. Quem protege é o
> `proxy.ts`, e só o que está em `/unit/**`. Ver
> [`autenticacao.md`](autenticacao.md).

## Server e Client Components

Regra prática: **`page.tsx` e `layout.tsx` ficam no servidor**; a
interatividade desce para arquivos irmãos com `'use client'`.

O `page.tsx` exporta `metadata`, lê `params`/`searchParams` (com `await`) e
entrega o resultado como prop ao filho client — veja
[`units/page.tsx`](<../src/app/(triage)/units/page.tsx>) passando
`emergencyLevel` para `UnitsView`. Ele não busca dados nem tem estado.

Componente que depende de `window` (Leaflet, `navigator.geolocation`,
`sessionStorage`) é client e, quando a biblioteca quebra no servidor, entra com
`next/dynamic` e `ssr: false` — veja
[`units-map/index.tsx`](../src/components/units-map/index.tsx).

## Fronteiras entre camadas

| Camada | Pode importar | Não pode |
|---|---|---|
| `app/**` | components, hooks, services, libs; código do próprio grupo de rota | `app/**` de outro grupo |
| `components/**` | components, hooks, libs, tipos de services | `app/**` |
| `services/**` | `libs/api`, tipos de `libs/constants` e de outros services | components, hooks |
| `libs/**` | outras libs | components, services |

A seta aponta sempre para baixo. Um `service` importar componente (para reusar
um tipo, por exemplo) inverte a dependência e é o começo de um ciclo. Tipo de
domínio compartilhado (`UrgencyLevel`, `Network`, `Occupancy`) mora em
[`libs/constants.ts`](../src/libs/constants.ts).

## Variáveis de ambiente

Três arquivos, com papéis distintos:

- [`src/libs/env.schema.ts`](../src/libs/env.schema.ts) — os schemas, sem efeito
  colateral. Importável de qualquer lugar, inclusive do `next.config.ts`.
- [`src/libs/env.ts`](../src/libs/env.ts) — variáveis públicas (`NEXT_PUBLIC_*`),
  seguras no browser.
- [`src/libs/env.server.ts`](../src/libs/env.server.ts) — variáveis privadas,
  com `import 'server-only'`. Se um Client Component importar isso, o build
  falha — que é exatamente o objetivo.

| Variável | Para quê |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base do axios no browser. Deixe `/api`. |
| `PRIVATE_API_URL` | URL absoluta do backend. Alimenta o rewrite e as chamadas server-side. |
| `SESSION_SECRET` | **O mesmo** `SESSION_SECRET` do backend, para verificar o JWT da recepção. |
| `NEXT_PUBLIC_FILES_API_URL` | CDN de arquivos. Opcional. |

O `next.config.ts` valida a env **antes** de qualquer uso, então uma variável
faltando falha o `npm run build` com a lista do que está errado, em vez de
quebrar em runtime longe da causa.

> Os arquivos `.env*` são lidos da **raiz do app** (`apps/web/`), nunca de
> `src/`.
