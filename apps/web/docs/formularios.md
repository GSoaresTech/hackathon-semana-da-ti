# Formulários: React Hook Form + Zod

Referência viva:
[`components/forms/signin-form.tsx`](../src/components/forms/signin-form.tsx),
o login da recepção. O comentário no topo dele é a receita resumida.

## Quando é formulário e quando é passo do fluxo

- **Formulário com validação e envio** (login, e qualquer cadastro futuro da
  área `/unit`): React Hook Form + Zod + `zodResolver`, sempre.
- **Passos da triagem** (`/symptoms`, `/questions`): **não** usam React Hook
  Form. Cada resposta vai direto para o store `useTriage`, porque precisa
  sobreviver à troca de tela e ao recarregamento (`sessionStorage`). O botão
  "Continuar" fica desabilitado até a etapa estar completa — ver
  [`questions-form.tsx`](<../src/app/(triage)/questions/questions-form.tsx>) e
  [`estado.md`](estado.md).

Não misture: duplicar o estado no RHF **e** no store é ter duas fontes de
verdade.

## A receita

```tsx
'use client';

// 1. Schema em escopo de módulo, no mesmo arquivo do formulário.
const signInSchema = z.object({
  phone: z
    .string()
    .transform((value) => value.replace(/\D/g, ''))
    .refine((value) => value.length === 10 || value.length === 11, {
      error: 'Digite o telefone com DDD',
    }),
  password: z.string().min(1, { error: 'Digite sua senha' }),
});

type SignInValues = z.input<typeof signInSchema>;

const SignInForm: React.FC<SignInFormProps> = ({ redirect }) => {
  // 2. useForm com zodResolver e defaultValues COMPLETO.
  const form = useForm<SignInValues, unknown, z.output<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: { phone: '', password: '' },
  });

  // 3. useMutation chamando a função de ~/services.
  const { mutateAsync, isPending } = useMutation({ mutationFn: createSession });

  // 4. Handler com guarda + toast.promise. Sem try/catch.
  function onSubmit(values: z.output<typeof signInSchema>) {
    if (isPending) return;

    toast.promise(mutateAsync(values), {
      loading: 'Entrando…',
      success: () => {
        router.replace(target);
        return 'Bem-vindo de volta';
      },
      error: (error: Error) => error.message,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>{/* ... */}</form>
    </Form>
  );
};

export { SignInForm };
```

### Por que cada passo

- **Schema no mesmo arquivo.** Ele é parte do formulário e só ele o usa. Não
  extraia para `schema.ts`.
- **`defaultValues` completo.** Campo que começa `undefined` monta um input não
  controlado; quando ganha valor, o React acusa a troca.
- **`z.input` / `z.output` nos genéricos.** Quando o schema tem `transform`, o
  valor do input (com máscara) e o validado (só dígitos) são tipos diferentes
  para o RHF. Passar os dois deixa isso explícito.
- **`if (isPending) return`.** Trava o duplo clique antes de a mutação começar.
- **`toast.promise` em vez de `try/catch`.** O interceptor do axios já
  transformou a falha num `Error` com mensagem exibível.
- **`noValidate`.** Quem valida é o Zod; a validação nativa do browser mostraria
  balões fora do design.

## Zod v4 — o que mudou

Este projeto usa **Zod 4**. Se você aprendeu com Zod 3, três coisas mudaram:

```ts
// Zod 3                              // Zod 4
z.string({ required_error: 'X' })     z.string({ error: 'X' })
z.string().min(2, { message: 'X' })   z.string().min(2, { error: 'X' })
z.string().email()                    z.email()
z.string().url()                      z.url()
```

`error` cobre tanto o campo ausente quanto o valor inválido.

## Estrutura visual

```tsx
<form className="flex flex-col gap-4">
  <FormField
    control={form.control}
    name="phone"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Telefone</FormLabel>
        <FormControl><Input {...field} /></FormControl>
        <FormMessage />        {/* erro do Zod aparece aqui */}
      </FormItem>
    )}
  />

  <Button type="submit" block>Entrar</Button>
</form>
```

Uma coluna, campos de 48px, botão `block` no fim — é uma tela de celular. Os
blocos `FormSection*` e `FormFieldGroup` de
[`ui/form.tsx`](../src/components/ui/form.tsx) existem para layouts em colunas
(desktop), caso o painel da unidade precise.

## Armadilhas

### Transform que muda o tipo

**Não faça** `string` virar `string | null` no schema:

```ts
// ❌ os genéricos do RHF divergem entre o valor do input e o validado
note: z.string().transform((v) => v || null)

// ✅ o schema valida, o handler adapta
note: z.string()
// e no handler:
mutateAsync({ note: values.note || null })
```

Transform que preserva o tipo (`string` → `string`, como tirar a máscara do
telefone) é bem-vindo.

### Máscaras: `onInput`, não `onChange`

O Maskito escreve direto no DOM. O React Hook Form só enxerga a mudança pelo
evento `input`:

```tsx
const phoneMaskRef = useMaskito({ options: phoneMaskOptions });

<Input
  {...field}
  ref={phoneMaskRef}
  onInput={field.onChange}
  inputMode="tel"
  autoComplete="tel-national"
/>
```

As máscaras ficam em [`libs/mask.ts`](../src/libs/mask.ts). Remova a máscara
antes de enviar, no schema (`.transform((value) => value.replace(/\D/g, ''))`).

### Teclado certo no celular

`inputMode="tel"` / `"numeric"` e `autoComplete` corretos não são detalhe: é
o que abre o teclado numérico e deixa o gerenciador de senhas preencher.

### Hidratar formulário de edição uma vez só

```tsx
const hydratedRef = useRef(false);

useEffect(() => {
  if (!query.data || hydratedRef.current) return;

  form.reset({ name: query.data.unit.name });
  hydratedRef.current = true;
}, [query.data, form]);
```

Sem o guarda, qualquer refetch chamaria `reset` de novo e apagaria o que a
pessoa estivesse digitando. Use `useRef` e não `useState`: o valor não afeta o
render, e `setState` dentro de efeito é proibido neste projeto.

## Erros vindos do servidor

O backend responde `{ error: 'mensagem' }` — uma mensagem só, sem detalhe por
campo. Então erro de servidor aparece **no toast**, não embaixo do input
(ex.: "Credenciais inválidas, tente novamente").

Se um dia a API passar a devolver erros por campo, o lugar de mapear é um
helper em `~/libs/api`, chamando `form.setError(campo, { message })`.

## Botão de submit

```tsx
<Button type="submit" block disabled={isPending}>
  {isPending && <LoaderIcon className="animate-spin" aria-hidden="true" />}
  Entrar
</Button>
```

O texto continua visível (verbo no imperativo, caixa normal) e o ícone de
carregamento entra ao lado. Nos passos do fluxo, o texto pode mudar para
explicar a espera — "Avaliando seus sintomas…" em `/questions`.
