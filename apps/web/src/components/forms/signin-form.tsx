'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMaskito } from '@maskito/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { LoaderIcon } from 'lucide-react';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '~/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { PasswordInput } from '~/components/ui/password-input';
import { getDefaultRouteByRole, ROLES_MAP } from '~/libs/constants';
import { cpfMaskOptions } from '~/libs/mask';
import { isValidCPF } from '~/libs/utils';
import { authenticateCredentials, createSession, listSelfProfiles } from '~/services/sessions';

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

const credentialsSchema = z.object({
  cpf: z
    .string({ error: 'Digite seu CPF' })
    .transform((value) => value.replace(/\D/g, ''))
    .refine(isValidCPF, { error: 'CPF inválido' }),
  password: z
    .string({ error: 'Digite sua senha' })
    .min(6, { error: 'No mínimo 6 caracteres' })
    .max(24, { error: 'No máximo 24 caracteres' }),
});

type CredentialsValues = z.infer<typeof credentialsSchema>;

interface SignInFormProps {
  /** Rota para onde voltar após o login, vinda de `?redirect=`. */
  redirect?: string;
}

const SignInForm: React.FC<SignInFormProps> = ({ redirect }) => {
  const cpfMaskRef = useMaskito({ options: cpfMaskOptions });

  // O login do idh-server tem dois passos: credenciais e escolha de perfil.
  const [step, setStep] = useState<'credentials' | 'profile'>('credentials');

  const form = useForm<CredentialsValues>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: { cpf: '', password: '' },
  });

  const credentialsMutation = useMutation({
    mutationFn: authenticateCredentials,
    onSuccess: () => setStep('profile'),
  });

  function handleSignIn(values: CredentialsValues) {
    if (credentialsMutation.isPending) return;

    const promise = credentialsMutation.mutateAsync(values);

    toast.promise(promise, {
      loading: 'Verificando credenciais...',
      success: 'Credenciais confirmadas!',
      error: (error) => error.message,
    });
  }

  if (step === 'profile') {
    return <ProfileStep redirect={redirect} onBack={() => setStep('credentials')} />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSignIn)} className="space-y-4">
        <FormField
          control={form.control}
          name="cpf"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CPF</FormLabel>
              <FormControl>
                {/* onInput (não onChange): o Maskito escreve direto no DOM. */}
                <Input
                  {...field}
                  ref={cpfMaskRef}
                  onInput={field.onChange}
                  maxLength={14}
                  inputMode="numeric"
                  autoComplete="username"
                />
              </FormControl>
              <FormDescription>Seu CPF de acesso.</FormDescription>
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

        <Button type="submit" className="mt-2 w-full" disabled={credentialsMutation.isPending}>
          {credentialsMutation.isPending ? (
            <LoaderIcon size={16} className="animate-spin" />
          ) : (
            'Continuar'
          )}
        </Button>
      </form>
    </Form>
  );
};

interface ProfileStepProps {
  redirect?: string;
  onBack: () => void;
}

/**
 * Segundo passo: escolher com qual perfil entrar. O cookie `authorization`
 * emitido no passo anterior é o que autoriza esta consulta.
 */
const ProfileStep: React.FC<ProfileStepProps> = ({ redirect, onBack }) => {
  const router = useRouter();

  const { data, isPending, isError } = useQuery({
    queryKey: ['list-self-profiles'],
    queryFn: listSelfProfiles,
    retry: false,
  });

  const sessionMutation = useMutation({
    mutationFn: createSession,
    onSuccess: (_, variables) => {
      const profile = data?.profiles.find((item) => item.id === variables.profileId);

      // `redirect` vem de `?redirect=` na URL: string em runtime, então o
      // `typedRoutes` exige o cast explícito.
      router.replace((redirect as Route) || getDefaultRouteByRole(profile?.role));
      // Recarrega os Server Components para que o proxy enxergue o novo cookie.
      router.refresh();
    },
  });

  function handleSelectProfile(profileId: string) {
    if (sessionMutation.isPending) return;

    const promise = sessionMutation.mutateAsync({ profileId });

    toast.promise(promise, {
      loading: 'Entrando...',
      success: 'Sessão iniciada!',
      error: (error) => error.message,
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-semibold text-foreground">Escolha o perfil</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sua conta tem acesso a mais de um perfil.
        </p>
      </div>

      {isPending && <p className="text-sm text-muted-foreground">Carregando perfis...</p>}

      {isError && (
        <p className="text-sm text-destructive">
          Não foi possível carregar seus perfis. Tente entrar novamente.
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {data?.profiles.map((profile) => (
          <li key={profile.id}>
            <Button
              variant="outline"
              className="h-auto w-full justify-start py-3 text-left"
              disabled={sessionMutation.isPending}
              onClick={() => handleSelectProfile(profile.id)}
            >
              <span className="flex flex-col items-start">
                <span className="font-medium">
                  {profile.companyName || 'Sem empresa vinculada'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {ROLES_MAP[profile.role] ?? 'Papel desconhecido'}
                </span>
              </span>
            </Button>
          </li>
        ))}
      </ul>

      <Button variant="ghost" className="w-full" onClick={onBack}>
        Voltar
      </Button>
    </div>
  );
};

export { SignInForm };
