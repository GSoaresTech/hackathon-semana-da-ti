# Componentes e o padrão de subcomponentes

Antes de criar qualquer peça visual, confira [`design-system.md`](design-system.md):
ele lista o que já existe, o nome de cada componente no PDF do design e os
tokens permitidos.

## O padrão da casa

Quando um componente tem partes que só fazem sentido juntas (uma tela e seu
cabeçalho, uma lista de chips e seus chips), o padrão é:

**Uma família de exports irmãos com prefixo comum, num arquivo só.**

```tsx
<Screen>
  <ScreenHeader backHref="/" step={1} />
  <ScreenContent>
    <ScreenTitle>O que você está sentindo?</ScreenTitle>
    <ScreenDescription>Marque tudo o que se aplica.</ScreenDescription>
    {/* conteúdo */}
  </ScreenContent>
  <ScreenFooter emergency="fixed">
    <Button block>Continuar</Button>
  </ScreenFooter>
</Screen>
```

Referência canônica: [`src/components/screen/index.tsx`](../src/components/screen/index.tsx).
Outro exemplo menor: `SymptomChip` + `SymptomChipList` em
[`symptom-chip/index.tsx`](../src/components/symptom-chip/index.tsx).

### O que NÃO usamos

**Dot-notation.** Nada de `Screen.Header`, `Card.Body`, `Object.assign(Screen, {...})`.

Por quê: o objeto composto é sempre importado inteiro, então o bundler não
consegue descartar as partes não usadas; e "ir para a definição" no editor cai
no `Object.assign`, não no componente.

### Anatomia

```tsx
// 1. Partes de layout: repassam className e props nativas, juntando com cn().
const ScreenContent: React.FC<React.ComponentProps<'div'>> = ({ className, ...props }) => {
  return <div className={cn('flex flex-1 flex-col gap-6 px-4 pt-4 pb-6', className)} {...props} />;
};

// 2. Partes com comportamento: props próprias, documentadas com JSDoc.
interface ScreenFooterProps extends React.ComponentProps<'div'> {
  /** `fixed`: o "Emergência 192" flutua logo acima do botão principal. */
  emergency?: 'fixed';
}

// 3. Um export no fim, em ordem alfabética.
export { Screen, ScreenContent, ScreenDescription, ScreenFooter, ScreenHeader, ScreenTitle };
```

### Quando precisa de Context

As partes do `Screen` não compartilham estado: é composição pura, sem Context.
Esse é o caso comum — e o preferido, porque Context tem custo (re-render de
todos os consumidores).

Se um dia as partes precisarem de um valor declarado uma vez no Root e lido
pelos filhos, use um Context **privado do módulo**, com um hook que falha alto
fora do Root:

```tsx
const ThingContext = createContext<ThingContextValue | null>(null);

function useThingContext(component: string): ThingContextValue {
  const context = useContext(ThingContext);

  if (!context) {
    throw new Error(`<${component} /> precisa estar dentro de <ThingRoot />`);
  }

  return context;
}
```

O exemplo real no projeto é o `FormItemContext` do shadcn em
[`ui/form.tsx`](../src/components/ui/form.tsx), que liga `FormLabel`,
`FormControl` e `FormMessage` pelo mesmo `id`.

## Onde cada componente mora

| Pasta | O que vai |
|---|---|
| `components/ui/` | primitivas shadcn ajustadas ao design (`button`, `input`, `form`, `password-input`, `skeleton`, `sonner`, `textarea`, `label`) |
| `components/forms/` | formulários (`signin-form.tsx`) |
| `components/<familia>/index.tsx` | peças do design system: `screen`, `emergency-button`, `unit-card`, `urgency-badge`, `result-card`… |
| `app/<grupo>/<tela>/<tela>-*.tsx` | tudo que só aquela tela usa (`units-view.tsx`, `unit-occupancy.tsx`) |

Regra: **começa colocado na rota.** Só promova para `components/` quando uma
segunda rota precisar, ou quando a peça está no PDF do design system.

## shadcn/ui

As primitivas em `components/ui/` vieram do CLI e **são nossas depois de
instaladas** — foram reescritas com os tokens do Triar e podem ser editadas.

```bash
npx shadcn@latest add <componente>   # dentro de apps/web
```

Depois de instalar, troque as classes do shadcn (`bg-primary`, `text-sm`,
`rounded-md` de 6px…) pelos tokens do design (`bg-brand-600`, `text-label`,
`rounded-md` de 14px) e garanta alvo de toque de 48px.

### Alterações já feitas nas primitivas

- `button.tsx` — variantes do design (`primary`, `secondary`, `ghost`), prop
  `block`, altura mínima de 48px.
- `input.tsx` / `textarea.tsx` — `rounded-sm`, contorno `border-control`,
  `aria-invalid` em `urg-red`; input com 48px de altura.
- `skeleton.tsx` — fundo `surface-tint` **sem** `animate-pulse` (nada pisca).
- `sonner.tsx` — tema fixo em `light`.
- `form.tsx` — acrescentados `FormSection*` e `FormFieldGroup`.

Ao rodar `shadcn add` com `--overwrite`, confira se alguma dessas edições foi
desfeita.

## Estados de carregamento

- **Skeleton com a forma final** enquanto a query carrega ou o store ainda não
  hidratou (`!hydrated`). Três cards em `/units`, chips de larguras variadas em
  `/symptoms`.
- **Tela vazia** (`<Screen />`) enquanto o `useTriageGuard` decide se a etapa
  pode abrir — evita piscar o conteúdo antes de um redirecionamento.
- `loading.tsx` não é usado hoje: as páginas são leves e o carregamento real é
  no cliente.

## Regras do React Compiler

São proibidos neste projeto (convenção; o Biome não checa):

- `setState` dentro de `useEffect` → use `useRef` quando o valor não afeta o
  render, ou derive o valor dos props/estado que você já tem (como
  `activeId = selectedId ?? units[0]?.id` em `units-view.tsx`).
- Função impura no render (`Math.random()`, `Date.now()`) → passe por prop ou
  calcule fora do render.
- Para ler de fonte externa (`sessionStorage`, `matchMedia`, APIs do browser),
  use `useSyncExternalStore` — veja `useTriageHydrated` em
  [`triage-store.ts`](<../src/app/(triage)/triage-store.ts>).

Não são preciosismo: as duas primeiras causam render em cascata e erro de
hidratação de verdade.

## Acessibilidade

- Botão só com ícone precisa de `aria-label` (o "voltar" do `ScreenHeader`, o
  192 compacto). Ícone decorativo leva `aria-hidden="true"`.
- Elemento clicável é `<button>` ou `<a>`, não `<div onClick>`.
- Escolha única é **rádio nativo** (`role="radiogroup"` + `<input type="radio"
  className="sr-only">` dentro do `<label>`): as setas do teclado já navegam.
  Veja `NetworkSelector`, `OptionGroup`, `IntensityScale`.
- Escolha múltipla é botão com `aria-pressed` (`SymptomChip`).
- Barra de etapas com `role="progressbar"` e `aria-valuenow`; lista que se
  atualiza sozinha com `aria-live="polite"`.
- Cor nunca sozinha: nível com número + palavra (e `sr-only` "Nível N"),
  lotação com palavra, seleção com contorno/✓.
- `<FormLabel>` já associa label e input pelo `id` — não escreva `<label>` na
  mão dentro de formulário RHF.
