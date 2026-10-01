import type { Metadata } from 'next';
import Link from 'next/link';

import { Brand } from '~/components/brand';
import { SignInForm } from '~/components/forms/signin-form';
import { Screen, ScreenContent, ScreenHeader, ScreenTitle } from '~/components/screen';

export const metadata: Metadata = { title: 'Entrar' };

export default async function SignInPage({ searchParams }: PageProps<'/signin'>) {
  // No Next 16 `searchParams` é uma Promise — o acesso síncrono foi removido.
  const { redirect } = await searchParams;

  return (
    <Screen>
      <ScreenHeader backHref="/">
        <Brand />
      </ScreenHeader>

      <ScreenContent className="pt-6">
        <div className="flex flex-col gap-1">
          <ScreenTitle>Área da unidade</ScreenTitle>
          <p className="text-body text-ink-muted">
            Entre com o telefone e a senha da recepção para atualizar a lotação.
          </p>
        </div>

        <SignInForm redirect={typeof redirect === 'string' ? redirect : undefined} />

        <p className="text-center text-caption text-ink-muted">
          Procurando atendimento?{' '}
          <Link href="/" className="text-brand-700 underline underline-offset-4">
            Comece a triagem
          </Link>
        </p>
      </ScreenContent>
    </Screen>
  );
}
