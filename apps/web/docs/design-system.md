# Design system

A fonte da verdade são dois PDFs na raiz do monorepo:

- [`docs/Triar-design-system.pdf`](../../../docs/Triar-design-system.pdf) — cores,
  tipografia, forma, componentes e tom de voz (Design system v1).
- [`docs/Triar-telas.pdf`](../../../docs/Triar-telas.pdf) — as 8 telas do MVP, com
  os componentes e a rota de API de cada uma.

Este documento resume os PDFs e aponta onde cada coisa mora no código. Se os
dois discordarem, o PDF vence e o código é corrigido.

> Os PDFs escrevem rotas e valores em português (`/api/sintomas`,
> `rede=publica`, `nivel`). No código **tudo é inglês**: `/api/symptoms`,
> `network=public`, `level`. Ver [`convencoes.md`](convencoes.md#idioma).

## Princípios

1. **Uma decisão por tela.** Um título, o conteúdo e um botão primário no
   rodapé. Nada de menus.
2. **Emergência sempre a um toque.** O "Emergência 192" está em **todas** as
   telas: fixo no canto inferior direito nas telas curtas
   (`ScreenFooter emergency="fixed"`) e compacto no cabeçalho nas telas com
   rolagem (`ScreenHeader emergency`). Abre `tel:192` — inclusive na rede
   privada: emergência é sempre SAMU.
3. **Cor nunca sozinha.** Nível de urgência = cor + número + palavra
   (`3 Urgente`). Lotação = ponto colorido + palavra (`● Tranquila`). Seleção
   leva contorno e, nos chips, um ✓. Vermelho e verde têm brilho parecido —
   quem é daltônico depende do número e da palavra.
4. **Não é diagnóstico.** O app orienta e encaminha. Sempre "seus sintomas
   indicam…", nunca "você tem…".

### Tom de voz

| Regra | Faça | Evite |
|---|---|---|
| Trate por "você", frases curtas | "Procure uma UPA hoje" | "Recomenda-se dirigir-se a uma unidade" |
| Português simples, sem termo clínico | "Falta de ar", "dor no peito" | "Dispneia", "precordialgia" |
| Caixa normal (*sentence case*), sem emoji | "Ver unidades indicadas" | "VER UNIDADES 🏥" |
| Aviso legal visível | `Disclaimer` fixo no Início e no Resultado | Esconder o aviso em letra miúda |

Botão é verbo no imperativo: "Continuar", "Ver resultado", "Como chegar".

### Privacidade (LGPD)

Dado de saúde **não vai para banco**. Ele vive em dois lugares só:

- no `sessionStorage` do aparelho, pelo store da triagem
  ([`triage-store.ts`](<../src/app/(triage)/triage-store.ts>)) — some ao fechar
  a aba;
- dentro do token assinado do QR do cartão (`POST /api/cards`).

Qualquer tela nova que mostre ou guarde dado de saúde segue a mesma regra.

## Tokens

Definidos no bloco `@theme` de [`src/app/globals.css`](../src/app/globals.css).
Tailwind v4 é CSS-first: cada variável vira utilitário (`--color-brand-600` →
`bg-brand-600`, `text-brand-600`, `border-brand-600`…). **Nunca fixe cor em
componente** — nem hexadecimal, nem paleta padrão do Tailwind (`bg-blue-500`).

### Cores

| Token | Classe (exemplo) | Uso |
|---|---|---|
| `brand-600` | `bg-brand-600` | Azul da marca: botão primário, seleção, foco, links |
| `brand-700` | `bg-brand-700`, `text-brand-700` | Hover/pressionado do primário; texto azul sobre `surface-tint` |
| `brand-400` | `fill-brand-400` | Só preenchimento e ilustração (halo do mapa). **Nunca texto** |
| `on-brand` | `text-on-brand` | Texto e ícone sobre `brand-600`/`brand-700` |
| `focus-ring` | `outline-focus-ring` | Anel de foco (igual a `brand-600`) |
| `surface` | `bg-surface` | Fundo de cards e campos |
| `surface-subtle` | `bg-surface-subtle` | Fundo da página atrás dos cards (é o fundo do `body`) |
| `surface-tint` | `bg-surface-tint` | Opção/chip selecionado, destaque informativo, `Disclaimer`, skeleton |
| `border` | `border-border` | Divisórias e contorno decorativo de card. Nunca o único contorno de um controle |
| `border-control` | `border-border-control` | Contorno de campos, chips e opções não selecionados |
| `ink` | `text-ink` | Texto principal e títulos |
| `ink-muted` | `text-ink-muted` | Texto secundário, legendas, metadados (distância, horário) |
| `urg-red` · `on-urg-red` · `urg-red-soft` | `bg-urg-red text-on-urg-red`, `bg-urg-red-soft` | Nível 1 · Emergência; botão 192; bloco "Ligue 192 se aparecer" |
| `urg-orange` · `on-urg-orange` · `urg-orange-soft` | `bg-urg-orange text-on-urg-orange` | Nível 2 · Muito urgente |
| `urg-yellow` · `on-urg-yellow` · `urg-yellow-soft` | `bg-urg-yellow text-on-urg-yellow` | Nível 3 · Urgente |
| `urg-green` · `on-urg-green` · `urg-green-soft` | `bg-urg-green text-on-urg-green` | Nível 4 · Pouco urgente |
| `urg-blue` · `on-urg-blue` · `urg-blue-soft` | `bg-urg-blue text-on-urg-blue` | Nível 5 · Não urgente |
| `occupancy-low` / `-medium` / `-high` | `bg-occupancy-low` | Ponto da lotação (Tranquila / Moderada / Lotada). A palavra fica em `ink` |
| `network-public` / `network-private` | `bg-network-public` | Etiqueta "SUS" (azul) / "Plano" (ink) e pinos do mapa |

As cores `urg-*` são **só para urgência**, nunca decoração. Laranja, amarelo e
azul levam texto escuro (`on-urg-*`); por isso use sempre o par
`bg-urg-X text-on-urg-X`. A variante `-soft` é o fundo do cabeçalho do
`ResultCard`.

O `globals.css` também define aliases no formato do shadcn (`primary`,
`muted-foreground`, `destructive`, `ring`…) apontando para os tokens acima.
Eles existem para as primitivas de `components/ui/` continuarem funcionando;
em código novo, prefira o nome do Triar (`bg-brand-600`, não `bg-primary`).

### Tipografia

Uma família só: **Nunito** (400, 600, 700, 800), carregada por `next/font` em
[`layout.tsx`](../src/app/layout.tsx). Corpo nunca abaixo de 15px — muita gente
vai usar o app com pressa, idosa ou passando mal.

Cada classe já traz tamanho, altura de linha e peso; não combine com
`font-bold`/`leading-*` sem motivo.

| Classe | Tamanho / linha · peso | Uso |
|---|---|---|
| `text-display` | 32 / 38 · 800 | Frase de ação do resultado; título da tela de emergência |
| `text-title` | 24 / 30 · 800 | Título de cada tela (`ScreenTitle`) |
| `text-heading` | 19 / 26 · 700 | Nome da unidade, título de seção dentro da tela |
| `text-body-lg` | 17 / 26 · 400 | Explicação do resultado e orientações |
| `text-body` | 15 / 22 · 400 | Texto corrido, perguntas, descrições (padrão do `body`) |
| `text-label` | 15 / 20 · 700 | Botões, chips, rótulos de campo |
| `text-caption` | 13 / 18 · 600 | Metadados: distância, tempo, horário, aviso curto |

### Espaçamento

A escala padrão do Tailwind já é a do design — não há token próprio:

| Design | Tailwind | Uso |
|---|---|---|
| space-1 · 4px | `p-1`, `gap-1` | Ícone e texto dentro de um chip |
| space-2 · 8px | `p-2`, `gap-2` | Entre chips; entre rótulo e campo |
| space-3 · 12px | `p-3`, `gap-3` | Padding vertical de botões e chips |
| space-4 · 16px | `p-4`, `px-4` | Margem lateral da tela; padding de card |
| space-6 · 24px | `p-6`, `gap-6` | Entre blocos de uma tela (`ScreenContent` usa `gap-6`) |
| space-8 · 32px | `p-8`, `pt-8` | Topo da tela até o título; antes do botão principal |

Alvo de toque: **no mínimo 48px** (`min-h-12`, `size-12`). A coluna das telas
tem no máximo 440px (`Screen`).

### Cantos, sombras, foco e movimento

| Token | Classe | Uso |
|---|---|---|
| `radius-sm` · 8px | `rounded-sm` | Campos de texto, etiqueta de rede |
| `radius-md` · 14px | `rounded-md` | Botões, opções de rede, células da escala 0–10 |
| `radius-lg` · 20px | `rounded-lg` | Cards de resultado, unidade e cartão de triagem |
| `radius-pill` · 999px | `rounded-pill` | Chips de sintoma, selos de urgência, botão 192 |
| `shadow-card` | `shadow-card` | Cards sobre `surface-subtle`. Sombra baixa e fria |
| `shadow-float` | `shadow-float` | **Só** o botão fixo "Emergência 192" |

- **Foco:** anel de 2px com 2px de afastamento em `focus-ring`, definido
  globalmente em `:focus-visible`. Não remova `outline`. Em grupos de rádio
  com `<input class="sr-only">`, o anel vai no `<label>` via
  `has-[input:focus-visible]:outline-2 …` (veja `NetworkSelector`). Sobre fundo
  vermelho, a classe `focus-on-dark` troca o anel para branco.
- **Movimento:** transições de 150ms (`transition-colors` já usa esse padrão),
  só em cor e fundo. **Nada pisca**, nem na emergência. `prefers-reduced-motion`
  zera tudo.
- **Tema:** só claro. O design não prevê modo escuro — não adicione `dark:`.

### Ícones

Lucide (`lucide-react`), traço de 2px, 24px (`size-6`) ou 20px nos botões, na
cor do texto ao lado. Ícone decorativo leva `aria-hidden="true"`. Sem emoji,
sem ilustração de pessoas ou órgãos; o único símbolo forte é o telefone do 192.

## Componentes

Os nomes da coluna "Design system" são os do PDF (classes `tr-*` e nomes de
componente). As famílias do projeto ficam em `components/<familia>/index.tsx`;
as primitivas, em `components/ui/`.

| Componente | Arquivo | Design system | Notas |
|---|---|---|---|
| `Button` | [`ui/button.tsx`](../src/components/ui/button.tsx) | Button · `tr-btn--primary` / `--secondary` / `--ghost`, `tr-btn--block` | `variant`: `primary` (um por tela, no rodapé), `secondary`, `ghost`. `block` ocupa a largura toda. `size`: `default` (48px), `sm`, `icon`. Desabilite enquanto faltar resposta obrigatória |
| `EmergencyButton` | [`emergency-button/index.tsx`](../src/components/emergency-button/index.tsx) | EmergencyButton · `tr-sos--fixed` / compacto | `variant="fixed"` ("Emergência 192", `shadow-float`) ou `"compact"` ("192"). Normalmente vem pelo `ScreenFooter`/`ScreenHeader`, não direto |
| `Disclaimer` | [`disclaimer/index.tsx`](../src/components/disclaimer/index.tsx) | Disclaimer | `full` no Início, `short` no Resultado. Texto fixo, fundo `surface-tint` — não é alerta de erro, nunca vermelho |
| `Screen`, `ScreenHeader`, `ScreenContent`, `ScreenTitle`, `ScreenDescription`, `ScreenFooter` | [`screen/index.tsx`](../src/components/screen/index.tsx) | Estrutura de tela (pág. 7 e 12 do PDF) | Esqueleto de toda tela. `ScreenHeader`: `backHref`, `step` (barra "1 de 3"), `title`, `emergency`. `ScreenFooter emergency="fixed"` põe o 192 flutuante |
| `Brand`, `BrandMark` | [`brand/index.tsx`](../src/components/brand/index.tsx) | Marca | "Triar" em Nunito 800 + cruz de pílulas em `brand-600`. Nome e marca provisórios |
| `NetworkSelector` | [`network-selector/index.tsx`](../src/components/network-selector/index.tsx) | NetworkSelector | Rádio nativo, SUS sempre primeiro. O valor vira `network` em `GET /api/units` |
| `SymptomChip`, `SymptomChipList` | [`symptom-chip/index.tsx`](../src/components/symptom-chip/index.tsx) | SymptomChip | Botão alternável com `aria-pressed`; marcado tem contorno + ✓ |
| `OptionGroup` | [`option-group/index.tsx`](../src/components/option-group/index.tsx) | — (opções lado a lado das perguntas) | Resposta única genérica (`onset`, `pregnant`). Rádio nativo |
| `IntensityScale` | [`intensity-scale/index.tsx`](../src/components/intensity-scale/index.tsx) | IntensityScale | 11 células 0–10, legendas nas pontas. **Não** pinte de verde a vermelho |
| `UrgencyBadge`, `LEVEL_SOFT_BACKGROUND` | [`urgency-badge/index.tsx`](../src/components/urgency-badge/index.tsx) | UrgencyBadge · `tr-urg--1` … `--5` | Sempre número + palavra (`URGENCY_LABELS`). O mapa `LEVEL_SOFT_BACKGROUND` é o `tr-result--N` |
| `ResultCard` | [`result-card/index.tsx`](../src/components/result-card/index.tsx) | ResultCard · `tr-result--N`, `tr-alert` | Cabeçalho no `-soft` do nível com o selo e a frase em `display`; "O que fazer agora"; bloco "Ligue 192 se aparecer" |
| `UnitCard`, `NetworkTag` | [`unit-card/index.tsx`](../src/components/unit-card/index.tsx) | UnitCard · `tr-tag--publica`/`--privada`, `tr-occ--baixa`/`media`/`alta` | Rede, lotação (ponto + palavra), distância, tempo. Expande ao selecionar ("Como chegar", "Ligar") |
| `UnitsMap` | [`units-map/index.tsx`](../src/components/units-map/index.tsx) + [`units-map-leaflet.tsx`](../src/components/units-map/units-map-leaflet.tsx) | "mapa" da tela Unidades | Leaflet + OpenStreetMap, só no cliente (`next/dynamic` com `ssr: false`). Pinos em SVG com `var(--color-…)` |
| `EmergencyScreen` | [`emergency-screen/index.tsx`](../src/components/emergency-screen/index.tsx) | EmergencyScreen | Tela cheia `urg-red`, botão "Ligar 192" branco. Usa `focus-on-dark` |
| `TriageCard` | [`triage-card/index.tsx`](../src/components/triage-card/index.tsx) | TriageCard | QR (`qrcode.react`) com o token de `POST /api/cards`. O QR usa cor literal (ink sobre branco) porque vira imagem no "Salvar imagem" |
| `SignInForm` | [`forms/signin-form.tsx`](../src/components/forms/signin-form.tsx) | — (fora do PDF) | Login da recepção. Receita de formulário do projeto — ver [`formularios.md`](formularios.md) |
| `Input`, `Textarea`, `Label`, `PasswordInput` | [`ui/`](../src/components/ui/) | Campo de texto (`radius-sm`) | Input com 48px de altura; contorno `border-control`, `aria-invalid` em `urg-red` |
| `Form*` | [`ui/form.tsx`](../src/components/ui/form.tsx) | — | shadcn + React Hook Form |
| `Skeleton` | [`ui/skeleton.tsx`](../src/components/ui/skeleton.tsx) | — | Bloco `surface-tint` estático (sem pulsar — nada pisca) |
| `Toaster` | [`ui/sonner.tsx`](../src/components/ui/sonner.tsx) | — | Sonner, tema claro fixo, no topo da tela |

## Telas

| # | Tela | Rota | Componentes principais | API |
|---|---|---|---|---|
| 01 | Início | `/` — [`start-form.tsx`](<../src/app/(triage)/start-form.tsx>) | `Brand`, `Disclaimer`, `NetworkSelector`, `Button`, `EmergencyButton` (fixo) | — (só `navigator.geolocation`) |
| 02 | Sintomas (1 de 3) | `/symptoms` — [`symptoms-form.tsx`](<../src/app/(triage)/symptoms/symptoms-form.tsx>) | `SymptomChip`, `Textarea`, `Button`, `EmergencyButton` (fixo) | `GET /api/symptoms`; `POST /api/triage` sem respostas (só regras de sinal grave) |
| 03 | Perguntas (2 de 3) | `/questions` — [`questions-form.tsx`](<../src/app/(triage)/questions/questions-form.tsx>) | `OptionGroup`, `IntensityScale`, `Input`, `Button`, `EmergencyButton` (fixo) | `GET /api/symptoms` (perguntas por sintoma); `POST /api/triage` |
| 04 | Emergência | `/emergency` — [`emergency-view.tsx`](<../src/app/(triage)/emergency/emergency-view.tsx>) | `EmergencyScreen` | `POST /api/triage` → `emergency: true` (pula a IA) |
| 05 | Resultado | `/result` — [`result-view.tsx`](<../src/app/(triage)/result/result-view.tsx>) | `ResultCard`, `UrgencyBadge`, `Disclaimer` (curto), `Button`, `EmergencyButton` (compacto) | resultado de `POST /api/triage` (já no store) |
| 06 | Unidades | `/units` (`?level=1` vindo da Emergência) — [`units-view.tsx`](<../src/app/(triage)/units/units-view.tsx>) | `UnitsMap`, `UnitCard`, `UrgencyBadge`, `EmergencyButton` (compacto) | `GET /api/units?level=&network=&lat=&lng=` (refetch a cada 10 s) |
| 07 | Cartão (3 de 3) | `/card` — [`card-view.tsx`](<../src/app/(triage)/card/card-view.tsx>) | `TriageCard`, `Button`, `EmergencyButton` (compacto) | `POST /api/cards` |
| — | Login da recepção | `/signin` — [`signin/page.tsx`](<../src/app/(unit)/signin/page.tsx>) | `SignInForm` | `POST /api/sessions` |
| — | Lotação da unidade | `/unit` — [`unit-occupancy.tsx`](<../src/app/(unit)/unit/unit-occupancy.tsx>) | `Screen`, rádio de lotação, `Button` | `GET /api/sessions/me`; `PATCH /api/units/:unitId/occupancy` |
| 08 | Painel da unidade | **não implementado** | `UrgencyBadge`, tabela, detalhe | `GET /api/cards/:token` |

O painel da unidade (tela 08, leitura do QR na recepção) ficou fora do MVP. O
que já existe e o que falta estão em
[`docs/pending.md`](../../../docs/pending.md), na raiz do monorepo.
