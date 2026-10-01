import type { Roles } from '~/libs/constants';

/**
 * O que um item (rota, entrada de menu, botão) exige para ser acessível.
 * Campo ausente = sem restrição naquele eixo.
 */
interface Accessible {
  roles?: Roles[];
  feature?: string[];
}

/** Quem está tentando acessar. */
interface AccessContext {
  role?: Roles;
  features?: Record<string, boolean> | null;
}

/**
 * Decide se `item` é acessível em `context`. Função pura: mesma resposta no
 * servidor (proxy.ts) e no cliente (sidebar, guards).
 *
 * Isto é regra de UX, NÃO é segurança. A autorização que vale é a do backend —
 * esconder um botão não protege o endpoint por trás dele.
 */
function canAccess(item: Accessible, context: AccessContext): boolean {
  if (item.feature?.length) {
    if (!context.features) return false;
    if (!item.feature.some((flag) => context.features?.[flag] === true)) return false;
  }

  if (item.roles?.length) {
    if (context.role === undefined) return false;
    if (!item.roles.includes(context.role)) return false;
  }

  return true;
}

export type { AccessContext, Accessible };
export { canAccess };
