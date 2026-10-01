'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMaskito } from '@maskito/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LoaderIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
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
import { phoneMaskOptions } from '~/libs/mask';
import { QUERIES } from '~/libs/queries';
import { cn } from '~/libs/utils';
import { getUser, updateUser } from '~/services/users';

/*
 * Formulário de edição — o gêmeo do `create-user-form.tsx`.
 *
 * Só três coisas mudam em relação ao de criação:
 *   1. um `useQuery` para carregar os dados atuais;
 *   2. o guarda de hidratação (`hydrated`) explicado abaixo;
 *   3. duas invalidações (lista e detalhe) e o rótulo do botão.
 *
 * O CPF não aparece: é a credencial de acesso e não se edita por aqui.
 */
const formSchema = z.object({
  name: z
    .string({ error: 'Digite o nome' })
    .trim()
    .min(2, { error: 'No mínimo 2 caracteres' })
    .max(128, { error: 'No máximo 128 caracteres' }),
  // Igual ao formulário de criação: o schema mantém `string` na entrada e na
  // saída, e o handler adapta para `null` na hora de chamar a API.
  email: z.union([z.email({ error: 'E-mail inválido' }), z.literal('')]),
  phone: z
    .string()
    .transform((value) => value.replace(/\D/g, ''))
    .refine((value) => !value || value.length >= 10, {
      error: 'Telefone incompleto',
    }),
});

type FormValues = z.infer<typeof formSchema>;

interface UpdateUserFormProps {
  userId: string;
}

const UpdateUserForm: React.FC<UpdateUserFormProps> = ({ userId }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const phoneMaskRef = useMaskito({ options: phoneMaskOptions });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', email: '', phone: '' },
  });

  const userQuery = useQuery({
    queryKey: [QUERIES.GET_USER, userId],
    queryFn: () => getUser({ userId }),
  });

  /*
   * Hidrata o formulário UMA vez.
   *
   * Sem o guarda, qualquer refetch (voltar o foco na aba, invalidação vinda de
   * outra tela) chamaria `reset` de novo e apagaria o que o usuário estivesse
   * digitando.
   *
   * O guarda é `useRef` e não `useState` de propósito: ele não afeta o que é
   * renderizado, e `setState` dentro de efeito provoca render em cascata.
   */
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (!userQuery.data || hydratedRef.current) return;

    form.reset({
      name: userQuery.data.user.name,
      email: userQuery.data.user.email ?? '',
      phone: userQuery.data.user.phone ?? '',
    });
    hydratedRef.current = true;
  }, [userQuery.data, form]);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERIES.LIST_USERS] });
      queryClient.invalidateQueries({ queryKey: [QUERIES.GET_USER, userId] });
      router.push(`/users/${userId}`);
    },
  });

  function handleUpdateUser(values: FormValues) {
    if (isPending) return;

    const promise = mutateAsync({
      userId,
      name: values.name,
      email: values.email || null,
      phone: values.phone || null,
    });

    toast.promise(promise, {
      loading: 'Salvando...',
      success: 'Colaborador atualizado com sucesso!',
      error: (error) => error.message,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleUpdateUser)} className="flex flex-col">
        <FormSection>
          <FormSectionHeader>
            <FormSectionTitle>Dados do colaborador</FormSectionTitle>
            <FormSectionDescription>O CPF não pode ser alterado por aqui.</FormSectionDescription>
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
            </FormFieldGroup>

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
          </FormSectionFields>
        </FormSection>

        <div className="ml-auto mt-8 flex gap-4">
          <Button variant="ghost" asChild disabled={isPending}>
            <Link href={`/users/${userId}`}>Descartar alterações</Link>
          </Button>

          <Button type="submit" disabled={isPending || userQuery.isPending} className="relative">
            <span className={cn({ 'opacity-0': isPending })}>Salvar alterações</span>
            {isPending && (
              <LoaderIcon className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" />
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export { UpdateUserForm };
