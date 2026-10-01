'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMaskito } from '@maskito/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LoaderIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '~/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormFieldGroup,
  FormItem,
  FormLabel,
  FormMessage,
  FormSection,
  FormSectionDescription,
  FormSectionFields,
  FormSectionHeader,
  FormSectionTitle,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { PasswordInput } from '~/components/ui/password-input';
import { cpfMaskOptions, phoneMaskOptions } from '~/libs/mask';
import { QUERIES } from '~/libs/queries';
import { cn, isValidCPF } from '~/libs/utils';
import { createUser } from '~/services/users';

/*
 * Formulário de criação. O par `create-` / `update-` é a melhor forma de
 * aprender a convenção: leia os dois lado a lado — o de update difere apenas
 * pelo carregamento dos dados iniciais e pelo rótulo do botão.
 *
 * Schema em escopo de módulo, no mesmo arquivo. Não extraia para `schema.ts`:
 * o schema é parte do formulário e só ele o usa.
 */
const formSchema = z.object({
  name: z
    .string({ error: 'Digite o nome' })
    .trim()
    .min(2, { error: 'No mínimo 2 caracteres' })
    .max(128, { error: 'No máximo 128 caracteres' }),
  cpf: z
    .string({ error: 'Digite o CPF' })
    // A máscara vai embora antes do envio — o backend espera só dígitos.
    .transform((value) => value.replace(/\D/g, ''))
    .refine(isValidCPF, { error: 'CPF inválido' }),
  // Mantemos `string` na entrada e na saída do schema. Um transform que muda o
  // tipo (`string` → `string | null`) faz os genéricos do react-hook-form
  // divergirem entre o valor do input e o valor validado. Regra do projeto:
  // o schema VALIDA, o handler ADAPTA para o formato da API.
  email: z.union([z.email({ error: 'E-mail inválido' }), z.literal('')]),
  phone: z
    .string()
    .transform((value) => value.replace(/\D/g, ''))
    .refine((value) => !value || value.length >= 10, {
      error: 'Telefone incompleto',
    }),
  password: z
    .string({ error: 'Digite a senha inicial' })
    .min(6, { error: 'No mínimo 6 caracteres' })
    .max(24, { error: 'No máximo 24 caracteres' }),
});

type FormValues = z.infer<typeof formSchema>;

const CreateUserForm: React.FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const cpfMaskRef = useMaskito({ options: cpfMaskOptions });
  const phoneMaskRef = useMaskito({ options: phoneMaskOptions });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    // Sempre completo: campo que começa `undefined` vira input não-controlado
    // e o React avisa quando ele passa a ter valor.
    defaultValues: { name: '', cpf: '', email: '', phone: '', password: '' },
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: createUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERIES.LIST_USERS] });
      router.push(`/users/${data.id}`);
    },
  });

  function handleCreateUser(values: FormValues) {
    if (isPending) return;

    // Campo vazio vira `null` aqui, não no schema: a API distingue "não
    // informado" de string vazia.
    const promise = mutateAsync({
      name: values.name,
      cpf: values.cpf,
      password: values.password,
      email: values.email || null,
      phone: values.phone || null,
    });

    // toast.promise em vez de try/catch: o interceptor do axios já normalizou
    // qualquer falha num Error com mensagem pronta para o usuário.
    toast.promise(promise, {
      loading: 'Cadastrando...',
      success: 'Colaborador cadastrado com sucesso!',
      error: (error) => error.message,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleCreateUser)} className="flex flex-col">
        <FormSection>
          <FormSectionHeader>
            <FormSectionTitle>Dados do colaborador</FormSectionTitle>
            <FormSectionDescription>
              Informações básicas de identificação e contato.
            </FormSectionDescription>
          </FormSectionHeader>

          <FormSectionFields>
            <FormFieldGroup>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={128} />
                    </FormControl>
                    <FormDescription>Nome completo.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        ref={cpfMaskRef}
                        onInput={field.onChange}
                        maxLength={14}
                        inputMode="numeric"
                      />
                    </FormControl>
                    <FormDescription>Usado para entrar no sistema.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormFieldGroup>

            <FormFieldGroup>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
                    </FormControl>
                    <FormDescription>Opcional.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        ref={phoneMaskRef}
                        onInput={field.onChange}
                        maxLength={15}
                        inputMode="numeric"
                      />
                    </FormControl>
                    <FormDescription>Opcional.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormFieldGroup>
          </FormSectionFields>
        </FormSection>

        <FormSection className="mt-8">
          <FormSectionHeader>
            <FormSectionTitle>Acesso</FormSectionTitle>
            <FormSectionDescription>
              Senha inicial, trocada pelo colaborador no primeiro acesso.
            </FormSectionDescription>
          </FormSectionHeader>

          <FormSectionFields>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha inicial</FormLabel>
                  <FormControl>
                    <PasswordInput {...field} autoComplete="new-password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSectionFields>
        </FormSection>

        <div className="ml-auto mt-8 flex gap-4">
          <Button variant="ghost" asChild disabled={isPending}>
            <Link href="/users">Descartar</Link>
          </Button>

          <Button type="submit" disabled={isPending} className="relative">
            <span className={cn({ 'opacity-0': isPending })}>Cadastrar colaborador</span>
            {isPending && (
              <LoaderIcon className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" />
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export { CreateUserForm };
