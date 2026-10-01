'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMaskito } from '@maskito/react';
import { useMutation } from '@tanstack/react-query';
import { LoaderIcon } from 'lucide-react';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '~/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { PasswordInput } from '~/components/ui/password-input';
import { phoneMaskOptions } from '~/libs/mask';
import { createSession } from '~/services/sessions';

/*
 * RECEITA DE FORMULÁRIO DO PROJETO — este arquivo é o exemplo de referência.
 *
 * 1. 'use client' no topo.
 * 2. Schema Zod em escopo de módulo, no mesmo arquivo do formulário.
 * 3. useForm com zodResolver e `defaultValues` SEMPRE completo (senão o React
 *    reclama de input não-controlado virando controlado).
 * 4. useMutation chamando a função de `~/services`.
 * 5. Handler com guarda `if (isPending) return`.
 * 6. Feedback por `toast.promise` — nunca try/catch: o interceptor do axios já
 *    entrega um Error com mensagem pronta para o usuário.
 */

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

interface SignInFormProps {
  /** Rota para onde voltar após o login, vinda de `?redirect=`. */
  redirect?: string;
}

const SignInForm: React.FC<SignInFormProps> = ({ redirect }) => {
  const router = useRouter();
  const phoneMaskRef = useMaskito({ options: phoneMaskOptions });

  const form = useForm<SignInValues, unknown, z.output<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: { phone: '', password: '' },
  });

  const { mutateAsync, isPending } = useMutation({ mutationFn: createSession });

  function onSubmit(values: z.output<typeof signInSchema>) {
    if (isPending) return;

    toast.promise(mutateAsync(values), {
      loading: 'Entrando…',
      success: () => {
        // Só aceita destino interno (evita open redirect via ?redirect=).
        const target = redirect?.startsWith('/unit') ? redirect : '/unit';
        router.replace(target as Route);
        router.refresh();

        return 'Bem-vindo de volta';
      },
      error: (error: Error) => error.message,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
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
                  inputMode="tel"
                  autoComplete="tel-national"
                  placeholder="(81) 99999-9999"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <PasswordInput {...field} autoComplete="current-password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" block disabled={isPending} className="mt-2">
          {isPending && <LoaderIcon className="animate-spin" aria-hidden="true" />}
          Entrar
        </Button>
      </form>
    </Form>
  );
};

export { SignInForm };
