'use client';

import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { type TriageState, useTriage, useTriageHydrated } from './triage-store';

/**
 * Garante que a etapa anterior do fluxo foi cumprida. Quem abre, por exemplo,
 * `/result` direto (sem triagem feita) volta para `redirectTo`.
 *
 * Devolve `true` quando a tela pode renderizar. Antes da hidratação do store
 * devolve `false` sem redirecionar — o estado salvo ainda não foi lido.
 */
function useTriageGuard(
  isReady: (state: TriageState) => boolean,
  redirectTo: Route = '/',
): boolean {
  const router = useRouter();
  const hydrated = useTriageHydrated();
  const ready = useTriage(isReady);

  // Navegação é efeito colateral (sistema externo), não estado do React.
  useEffect(() => {
    if (hydrated && !ready) router.replace(redirectTo);
  }, [hydrated, ready, redirectTo, router]);

  return hydrated && ready;
}

export { useTriageGuard };
