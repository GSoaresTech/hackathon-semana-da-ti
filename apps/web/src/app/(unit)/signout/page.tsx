import type { Metadata } from 'next';

import { Screen } from '~/components/screen';

import { SignOutEffect } from './effect';

export const metadata: Metadata = { title: 'Saindo' };

export default function SignOutPage() {
  return (
    <Screen className="items-center justify-center px-6">
      <p className="text-body text-ink-muted">Encerrando sessão…</p>
      <SignOutEffect />
    </Screen>
  );
}
