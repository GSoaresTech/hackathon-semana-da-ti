'use client';

import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Redireciona quando o usuário não pode ver a tela.
 *
 * `isLoading` existe para não redirecionar durante o carregamento da sessão:
 * sem ele, `canAccess` seria `false` no primeiro render e todo mundo cairia
 * fora antes mesmo de a permissão ser conhecida.
 *
 * O retorno é derivado dos argumentos, sem estado próprio — guardar
 * `isRedirecting` em `useState` obrigaria a chamar `setState` dentro do efeito,
 * o que dispara renders em cascata (e a regra `react-hooks/set-state-in-effect`
 * do lint reprova).
 *
 * Isto é UX, não segurança — a proteção real é do backend.
 */
function useGuard(canAccess: boolean, redirectTo: Route = '/dashboard', isLoading = false) {
  const router = useRouter();

  useEffect(() => {
    if (isLoading || canAccess) return;

    router.replace(redirectTo);
  }, [canAccess, isLoading, redirectTo, router]);

  return {
    isAllowed: !isLoading && canAccess,
    isRedirecting: !isLoading && !canAccess,
  };
}

export { useGuard };
