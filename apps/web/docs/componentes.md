# Componentes e o padrão de subcomponentes

## O padrão da casa

Quando um componente tem partes que só fazem sentido juntas (uma lista e suas
linhas, um popover de filtro e seus itens), o padrão é:

**Uma família de exports irmãos com prefixo comum, num arquivo só, com o estado
compartilhado num Context local ao módulo.**

```tsx
<ListRoot cols="grid-cols-[auto_10rem_2rem]">
  <ListContent>
    <ListHead>…</ListHead>
    <ListItem>…</ListItem>
  </ListContent>
  <ListFooter page={page} pages={pages} onPageChange={setPage} />
</ListRoot>
```

Referência canônica: [`src/components/ui/list.tsx`](../src/components/ui/list.tsx).

### O que NÃO usamos

**Dot-notation.** Nada de `List.Item`, `Card.Header`, `Object.assign(List, {...})`.

Por quê: o objeto composto é sempre importado inteiro, então o bundler não
consegue descartar as partes não usadas; e "ir para a definição" no editor cai
no `Object.assign`, não no componente.

### Anatomia

```tsx
'use client';

// 1. Context privado do módulo — não é exportado.
interface ListContextValue { cols: string }
const ListContext = createContext<ListContextValue | null>(null);

// 2. Hook de acesso que falha alto quando usado fora do Root.
function useListContext(component: string): ListContextValue {
  const context = useContext(ListContext);

  if (!context) {
    throw new Error(`<${component} /> precisa estar dentro de <ListRoot />`);
  }

  return context;
}

// 3. Root provê o valor.
const ListRoot: React.FC<ListRootProps> = ({ children, cols }) => {
  const value = useMemo(() => ({ cols }), [cols]);

  return <ListContext.Provider value={value}>{children}</ListContext.Provider>;
};

// 4. Filhos consomem.
const ListItem: React.FC<ListRowProps> = ({ children, className }) => {
  const { cols } = useListContext('ListItem');

  return <li className={cn('grid gap-4', cols, className)}>{children}</li>;
};

// 5. Um export no fim.
export { ListContent, ListFooter, ListHead, ListItem, ListItemEmpty, ListRoot };
```

O Context existe para o template de colunas ser declarado **uma vez** no Root e
lido por cada linha. A alternativa seria repetir `cols` em todo `ListItem` — e
uma hora alguém erra e a linha desalinha.

O `useMemo` no valor do provider evita criar objeto novo a cada render, que
re-renderizaria todos os consumidores.

### Quando NÃO precisa de Context

Se as partes não compartilham estado, é composição pura — sem Context.
Veja [`filter-popover`](../src/components/filter-popover/index.tsx): as partes
são só blocos de layout.

Context tem custo (re-render de todos os consumidores). Só use quando houver
mesmo algo a compartilhar.

## Onde cada componente mora

| Pasta | O que vai |
|---|---|
| `components/ui/` | primitivas: shadcn + adições genéricas (`list`, `password-input`) |
| `components/forms/` | formulários usados por mais de uma rota |
| `components/<familia>/index.tsx` | famílias do projeto: `container`, `heading`, `data`, `filter-popover` |
| `app/<rota>/<recurso>-*.tsx` | tudo que só aquela tela usa |

Regra: **começa colocado na rota.** Só promova para `components/` quando uma
segunda rota precisar.

## shadcn/ui

As primitivas em `components/ui/` vêm do CLI e **são nossas depois de
instaladas** — pode e deve editar.

```bash
npx shadcn@latest add <componente>
```

Antes de criar um componente de interface do zero, procure em
`components/ui/`. Há 24 primitivas instaladas.

### Alterações já feitas nas primitivas

- `sonner.tsx` — tema fixo em `light`. O template não monta `ThemeProvider`.
- `sidebar.tsx` — `SidebarMenuSkeleton` recebe `width` por prop. O original
  sorteava com `Math.random()` no render, o que é impuro: gera valor diferente
  no servidor e no cliente (erro de hidratação) e muda a cada re-render.
- `form.tsx` — acrescentados `FormSection*` e `FormFieldGroup`.

Ao rodar `shadcn add` com `--overwrite`, confira se alguma dessas edições foi
desfeita.

## Estados de carregamento

Duas camadas, com papéis diferentes:

- **`loading.tsx`** — Suspense do segmento. Cobre a navegação até a rota.
- **`isPending` do React Query** — cobre a troca de página e de filtro **dentro**
  da tela, que não remonta o segmento.

As duas são necessárias. Só `loading.tsx` deixa a lista congelada ao paginar;
só `isPending` deixa a tela em branco durante a navegação.

Na lista, renderize sempre o mesmo número de linhas:

```tsx
{Array.from({ length: PER_PAGE }).map((_, index) => {
  if (isPending) return <ListItem key={index}><Skeleton /></ListItem>;

  const user = users?.data[index];
  if (!user) return <ListItemEmpty key={index} />;

  return <ListItem key={user.id}>{/* ... */}</ListItem>;
})}
```

Altura constante = rodapé de paginação parado.

## Regras do React Compiler

São proibidos neste projeto (convenção; o Biome não checa):

- `setState` dentro de `useEffect` → use `useRef` quando o valor não afeta o
  render, ou derive o valor dos props/estado que você já tem.
- Função impura no render (`Math.random()`, `Date.now()`) → passe por prop ou
  calcule num efeito.
- Para ler de fonte externa (`matchMedia`, `localStorage`), use
  `useSyncExternalStore` — veja [`use-mobile.ts`](../src/hooks/use-mobile.ts).

Não são preciosismo: as duas primeiras causam render em cascata e erro de
hidratação de verdade.

## Acessibilidade

- Botão só com ícone precisa de `aria-label` ou `<span className="sr-only">`.
- Elemento clicável é `<button>`, não `<div onClick>`.
- Paginação dentro de `<nav aria-label="Paginação">`, com `aria-current="page"`
  na página atual.
- `<FormLabel>` já associa label e input pelo `id` — não escreva `<label>` na
  mão dentro de formulário.
