import type { Route } from 'next';

/**
 * Papéis de acesso.
 *
 * São números porque é assim que o backend armazena e compara. Nunca use o
 * literal (`role === 1`) no código — sempre `Roles.ADMINISTRATOR`.
 */
export enum Roles {
  SYSTEM = 0,
  ADMINISTRATOR = 1,
  MANAGER = 2,
  HR = 3,
  EMPLOYEE = 4,
}

export const ROLES_OPTIONS = [
  { value: Roles.SYSTEM, label: 'Sistema' },
  { value: Roles.ADMINISTRATOR, label: 'Administrador' },
  { value: Roles.MANAGER, label: 'Gestor' },
  { value: Roles.HR, label: 'Recursos Humanos' },
  { value: Roles.EMPLOYEE, label: 'Colaborador' },
] as const;

/** Converte uma lista de opções em mapa `value → label` para exibição. */
export function toLabelMap<T extends { value: string | number; label: string }>(
  options: readonly T[],
): Record<T['value'], string> {
  return options.reduce(
    (acc, option) => ({ ...acc, [option.value]: option.label }),
    {} as Record<T['value'], string>,
  );
}

export const ROLES_MAP = toLabelMap(ROLES_OPTIONS);

/**
 * Predicados de permissão. Um por capacidade, não um por tela — assim uma tela
 * nova reaproveita o predicado em vez de inventar outra regra.
 */
export function canManageUsers(role?: Roles): boolean {
  return role === Roles.SYSTEM || role === Roles.ADMINISTRATOR || role === Roles.HR;
}

export function canManageSettings(role?: Roles): boolean {
  return role === Roles.SYSTEM || role === Roles.ADMINISTRATOR;
}

/** Rota inicial após o login, por papel. */
const ROLE_DEFAULT_ROUTES: Partial<Record<Roles, Route>> = {
  [Roles.SYSTEM]: '/users',
  [Roles.ADMINISTRATOR]: '/users',
  [Roles.HR]: '/users',
};

export function getDefaultRouteByRole(role?: Roles): Route {
  return (role !== undefined && ROLE_DEFAULT_ROUTES[role]) || '/dashboard';
}
