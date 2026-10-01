'use client';

import type { Route } from 'next';

import { useGuard } from '~/hooks/use-guard';
import { useSession } from '~/hooks/use-session';
import { canAccess } from '~/libs/access';
import type { Roles } from '~/libs/constants';

interface RouteGuardProps {
  children: React.ReactNode;
  /** Papéis que podem ver o conteúdo. Ausente = qualquer sessão válida. */
  roles?: Roles[];
  redirectTo?: Route;
  /** O que mostrar enquanto carrega ou redireciona. */
  fallback?: React.ReactNode;
}

/**
 * Esconde a tela de quem não pode vê-la e redireciona.
 *
 * De novo: isto é UX. O backend continua sendo o responsável por recusar a
 * requisição — esconder o componente não protege o endpoint.
 */
const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  roles,
  redirectTo = '/dashboard',
  fallback = null,
}) => {
  const { data, isPending } = useSession();

  const allowed = canAccess({ roles }, { role: data?.session.role });
  const { isAllowed } = useGuard(allowed, redirectTo, isPending);

  if (isPending || !isAllowed) return <>{fallback}</>;

  return <>{children}</>;
};

export { RouteGuard };
