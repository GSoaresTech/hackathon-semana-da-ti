# Convenções de código

## Nomes

| Item | Convenção | Exemplo |
|---|---|---|
| Arquivo / pasta | `kebab-case` | `units-view.tsx`, `triage-store.ts` |
| Segmento dinâmico | `[camelCase]` | `[unitId]` |
| Componente | `PascalCase` | `UnitsView`, `UnitCard` |
| Props | `interface <Componente>Props` | `interface UnitCardProps` |
| Hook | arquivo `use-*.ts`, função `useX` | `use-geolocation.ts` → `useGeolocation` |
| Store Zustand | arquivo `<recurso>-store.ts`, hook `use<Recurso>` | `triage-store.ts` → `useTriage` |
| Entrada/saída de service | `<Verbo><Recurso>Input` / `Output` | `ListUnitsInput`, `ListUnitsOutput` |
| Constante de módulo | `SCREAMING_SNAKE_CASE` | `URGENCY_LABELS`, `REFETCH_INTERVAL_MS` |
| Enum | `SCREAMING_SNAKE` nos membros | `QUERIES.LIST_UNITS` |

## Idioma

**Tudo que é código é inglês:** identificadores, nomes de arquivo, propriedades
da API, valores de enum, caminhos da API e URLs de página.

```ts
network: 'public' | 'private'        // não 'publica' | 'privada'
occupancy: 'low' | 'medium' | 'high' // não 'baixa' | 'media' | 'alta'
GET /api/units                        // não /api/unidades
/symptoms, /result, /card             // não /sintomas, /resultado, /cartao
```

**Português:** texto de interface, prompts de IA e comentários. A tradução
entre os dois mundos mora num lugar só — os mapas `*_LABELS` de
[`libs/constants.ts`](../src/libs/constants.ts) (`NETWORK_LABELS.public` →
`'SUS'`, `OCCUPANCY_LABELS.low` → `'Tranquila'`).

Os PDFs do design usam nomes em português (`/api/sintomas`, `rede=publica`);
no código use sempre o equivalente em inglês.

## Exports

Sem `export default`. Um `export { ... }` no fim do arquivo:

```ts
const UnitCard: React.FC<UnitCardProps> = ({ unit, selected, onSelect, onGo }) => { /* ... */ };

export { NetworkTag, UnitCard };
```

Por quê: default export permite importar com qualquer nome, o que faz o mesmo
componente aparecer com três nomes diferentes em três arquivos. Export nomeado
também dá autocomplete no import e renomeia direito no editor.

**Única exceção**, exigida pelo Next: `page.tsx`, `layout.tsx`, `loading.tsx`,
`error.tsx`, `global-error.tsx`, `not-found.tsx`, `route.ts`.

## Barrel files

Só use `index.tsx` quando a pasta contém **uma família de componentes**
(`components/screen/index.tsx`, `components/unit-card/index.tsx`). Nesse caso o
`index` é a implementação, não um re-export.

Não crie barril para `ui/`, `forms/`, `services/`, `hooks/` ou `libs/` — importe
pelo caminho completo (`~/components/ui/button`). Barris grandes atrapalham
tree-shaking e criam ciclos de importação difíceis de rastrear.

## Ordem dos imports

Quem ordena é o **Biome** (`organizeImports`): rode `npm run format` na raiz e
não brigue com o resultado. Na prática fica assim:

1. `'use client'`
2. Pacotes (`@tanstack/…`, `lucide-react`, `next/…`, `react`, `zod`), em ordem
   alfabética
3. Alias `~/` em ordem alfabética (`~/components` → `~/hooks` → `~/libs` →
   `~/services`)
4. *(linha em branco)*
5. Relativos (`./triage-store`, `../use-triage-guard`) por último

```tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { UnitCard } from '~/components/unit-card';
import { QUERIES } from '~/libs/queries';
import { listUnits } from '~/services/units';

import { useTriage } from '../triage-store';
```

## Onde ficam os tipos

**Colocados, e não exportados por padrão.**

- Schema Zod: no próprio arquivo do formulário, em escopo de módulo.
- Props: `interface` logo acima do componente.
- Entrada/saída de service: `type` logo acima da função.
- Tipos de domínio usados em várias camadas (`UrgencyLevel`, `Network`,
  `Occupancy`, `UnitType`, `Onset`, `Pregnant`): em
  [`libs/constants.ts`](../src/libs/constants.ts), junto dos rótulos.

Exporte um tipo só quando outro arquivo precisar dele — por exemplo,
`ListedUnit` em [`services/units.ts`](../src/services/units.ts) é exportado
porque `UnitCard` e o mapa recebem unidades desse formato.

Não há pasta de tipos globais, `types.ts` nem `*.schema.ts` por feature.

## Componentes

Dois estilos coexistem e ambos são aceitos:

```tsx
// Preferido para componentes com props próprias
const UnitCard: React.FC<UnitCardProps> = ({ unit }) => { ... };

// Preferido em ui/, seguindo o shadcn
function Button({ className, ...props }: React.ComponentProps<'button'>) { ... }
```

Componente genérico (com parâmetro de tipo) usa `function`, porque
`React.FC` não aceita genérico — veja `OptionGroup<T>`.

Em `components/ui/` siga o shadcn: `React.ComponentProps<'x'>`, atributo
`data-slot`, `cva` para variantes, `asChild` via `Slot`. A pasta fica fora do
Biome (`biome.json`), para não brigar com o código gerado pelo CLI.

## Estilo

- Sempre `cn()` de `~/libs/utils` para juntar classes. Concatenar string
  quebra na hora de sobrescrever (`p-2` + `p-4` deixa os dois).
- **Só tokens do design system.** Nunca cor fixa (`bg-blue-500`, `#1463c7`).
  Use `bg-brand-600`, `text-ink-muted`, `border-border-control`,
  `bg-urg-yellow text-on-urg-yellow`. A tabela completa está em
  [`design-system.md`](design-system.md).
- Tipografia pelas classes do design (`text-title`, `text-body`,
  `text-caption`), não por `text-sm`/`text-lg`.
- Nada de `tailwind.config.js` — Tailwind v4 é CSS-first. Token novo vai no
  `@theme` de [`src/app/globals.css`](../src/app/globals.css), e só se estiver
  no PDF do design system.
- Só tema claro: não escreva classes `dark:`.

## Comentários

Comente **por quê**, não **o quê**. O código já diz o que faz.

```ts
// ruim: zera o resultado
setDescription: (description) => set({ description, emergency: null, result: null }),

// bom: mudar a entrada invalida o que foi calculado a partir dela
setDescription: (description) => set({ description, emergency: null, result: null }),
```

Vale comentar: decisões não óbvias, contornos de comportamento de biblioteca,
armadilhas conhecidas, regras de LGPD. Não vale: parafrasear a linha seguinte.
