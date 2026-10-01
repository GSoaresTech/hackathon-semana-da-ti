import type { Metadata } from 'next';

import { SignInForm } from '~/components/forms/signin-form';

export const metadata: Metadata = { title: 'Entrar' };

export default async function SignInPage({ searchParams }: PageProps<'/signin'>) {
  // No Next 16 `searchParams` é uma Promise — o acesso síncrono foi removido.
  const { redirect } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Entrar na plataforma
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Informe seu CPF e senha para continuar.
          </p>
        </header>

        <SignInForm redirect={typeof redirect === 'string' ? redirect : undefined} />
      </div>
    </main>
  );
}
