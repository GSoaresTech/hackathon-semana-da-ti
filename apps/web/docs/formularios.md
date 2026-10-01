# Formulários: React Hook Form + Zod

Referência viva:
[`create-user-form.tsx`](../src/components/forms/create-user-form.tsx) e
[`update-user-form.tsx`](../src/components/forms/update-user-form.tsx).
Ler os dois lado a lado é a forma mais rápida de pegar a convenção.

## A receita

```tsx
'use client';

// 1. Schema em escopo de módulo, no mesmo arquivo do formulário.
const formSchema = z.object({
  name: z.string({ error: 'Digite o nome' }).trim().min(2, { error: 'No mínimo 2 caracteres' }),
});

type FormValues = z.infer<typeof formSchema>;

const CreateUserForm: React.FC = () => {
  // 2. useForm com zodResolver e defaultValues COMPLETO.
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '' },
  });

  // 3. useMutation chamando a função de ~/services.
  const { mutateAsync, isPending } = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERIES.LIST_USERS] });
      router.push('/users');
    },
  });

  // 4. Handler com guarda + toast.promise. Sem try/catch.
  function handleCreateUser(values: FormValues) {
    if (isPending) return;

    toast.promise(mutateAsync(values), {
      loading: 'Cadastrando...',
      success: 'Cadastrado com sucesso!',
      error: (error) => error.message,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleCreateUser)}>{/* ... */}</form>
    </Form>
  );
};

export { CreateUserForm };
```

### Por que cada passo

- **Schema no mesmo arquivo.** Ele é parte do formulário e só ele o usa. Não
  extraia para `schema.ts`.
- **`defaultValues` completo.** Campo que começa `undefined` monta um input não
  controlado; quando ganha valor, o React acusa a troca.
- **`if (isPending) return`.** Trava o duplo clique antes de a mutação começar.
- **`toast.promise` em vez de `try/catch`.** O interceptor do axios já
  transformou a falha num `Error` com mensagem exibível.

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
<FormSection>                      {/* cabeçalho à esquerda, campos à direita */}
  <FormSectionHeader>
    <FormSectionTitle>Dados do colaborador</FormSectionTitle>
    <FormSectionDescription>Informações básicas.</FormSectionDescription>
  </FormSectionHeader>

  <FormSectionFields>
    <FormFieldGroup>               {/* lado a lado; empilha no mobile */}
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormDescription>Nome completo.</FormDescription>
            <FormMessage />        {/* erro do Zod aparece aqui */}
          </FormItem>
        )}
      />
    </FormFieldGroup>
  </FormSectionFields>
</FormSection>
```

`FormSection*` e `FormFieldGroup` são adições do projeto em
[`src/components/ui/form.tsx`](../src/components/ui/form.tsx); o resto é shadcn
padrão.

## Armadilhas

### Transform que muda o tipo

**Não faça** `string` virar `string | null` no schema:

```ts
// ❌ os genéricos do RHF divergem entre o valor do input e o validado
email: z.string().transform((v) => v || null)

// ✅ o schema valida, o handler adapta
email: z.union([z.email({ error: 'E-mail inválido' }), z.literal('')])
// e no handler:
mutateAsync({ email: values.email || null })
```

Transform que preserva o tipo (`string` → `string`, como tirar a máscara do
CPF) é bem-vindo.

### Máscaras: `onInput`, não `onChange`

O Maskito escreve direto no DOM. O React Hook Form só enxerga a mudança pelo
evento `input`:

```tsx
const cpfMaskRef = useMaskito({ options: cpfMaskOptions });

<Input {...field} ref={cpfMaskRef} onInput={field.onChange} maxLength={14} />
```

E remova a máscara antes de enviar, no schema:

```ts
cpf: z.string({ error: 'Digite o CPF' })
  .transform((value) => value.replace(/\D/g, ''))
  .refine(isValidCPF, { error: 'CPF inválido' })
```

### `<Select>` dentro do FormField

`<FormControl>` envolve o **trigger**, não o `<Select>`:

```tsx
<FormItem>
  <FormLabel>Situação</FormLabel>
  <Select onValueChange={field.onChange} defaultValue={field.value}>
    <FormControl>
      <SelectTrigger><SelectValue /></SelectTrigger>
    </FormControl>
    <SelectContent>{/* ... */}</SelectContent>
  </Select>
  <FormMessage />
</FormItem>
```

### Hidratar formulário de edição uma vez só

```tsx
const hydratedRef = useRef(false);

useEffect(() => {
  if (!userQuery.data || hydratedRef.current) return;

  form.reset({ name: userQuery.data.user.name });
  hydratedRef.current = true;
}, [userQuery.data, form]);
```

Sem o guarda, qualquer refetch chamaria `reset` de novo e apagaria o que a
pessoa estivesse digitando. Use `useRef` e não `useState`: o valor não afeta o
render, e `setState` dentro de efeito é proibido neste projeto.

## Erros vindos do servidor

O backend responde `{ error: 'mensagem' }` — uma mensagem só, sem detalhe por
campo. Então erro de servidor aparece **no toast**, não embaixo do input.

Se um dia a API passar a devolver erros por campo, o lugar de mapear é um
helper em `~/libs/api`, chamando `form.setError(campo, { message })`.

## Botão de submit

```tsx
<Button type="submit" disabled={isPending} className="relative">
  <span className={cn({ 'opacity-0': isPending })}>Cadastrar colaborador</span>
  {isPending && (
    <LoaderIcon className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" />
  )}
</Button>
```

O texto fica invisível em vez de ser removido: assim o botão mantém a largura e
o layout não salta quando o envio começa.
