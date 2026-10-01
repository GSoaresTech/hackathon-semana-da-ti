import type { Metadata } from 'next';

import { SignOutEffect } from './effect';

export const metadata: Metadata = { title: 'Saindo' };

export default function SignOutPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6">
      <p className="text-sm text-muted-foreground">Encerrando sessão...</p>
      <SignOutEffect />
    </main>
  );
}
