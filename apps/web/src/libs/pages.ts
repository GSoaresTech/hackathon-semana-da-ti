import { LayoutDashboardIcon, type LucideIcon, SettingsIcon, UsersIcon } from 'lucide-react';
import type { Route } from 'next';

import type { Accessible } from '~/libs/access';
import { Roles } from '~/libs/constants';

/**
 * Árvore de navegação — fonte única de verdade.
 *
 * Alimenta a sidebar (o que aparece), os guards (quem pode ver) e o `proxy.ts`
 * (o que exige sessão). Adicionar uma rota protegida aqui já a protege; criar a
 * pasta em `app/` sem registrar aqui deixa a rota aberta.
 */
interface Page extends Accessible {
  id: string;
  title: string;
  /** `Route` (e não `string`) para o `typedRoutes` validar cada URL daqui. */
  url: Route;
  icon: LucideIcon | null;
  /** Casa a rota e suas subrotas (`/users`, `/users/new`, `/users/123/edit`). */
  regex: RegExp;
  hidden?: boolean;
}

interface Group extends Accessible {
  id: string;
  title?: string;
  items: Page[];
}

const groups: Group[] = [
  {
    id: 'geral',
    title: 'Geral',
    items: [
      {
        id: 'dashboard',
        title: 'Início',
        url: '/dashboard',
        icon: LayoutDashboardIcon,
        regex: /^\/dashboard(\/.*)?$/,
      },
    ],
  },
  {
    id: 'pessoas',
    title: 'Pessoas',
    items: [
      {
        id: 'users',
        title: 'Colaboradores',
        url: '/users',
        icon: UsersIcon,
        regex: /^\/users(\/.*)?$/,
        roles: [Roles.SYSTEM, Roles.ADMINISTRATOR, Roles.HR],
      },
    ],
  },
  {
    id: 'sistema',
    title: 'Sistema',
    items: [
      {
        id: 'settings',
        title: 'Configurações',
        url: '/settings',
        icon: SettingsIcon,
        regex: /^\/settings(\/.*)?$/,
        roles: [Roles.SYSTEM, Roles.ADMINISTRATOR],
      },
    ],
  },
];

interface ProtectedPath {
  regex: RegExp;
  roles?: Roles[];
}

/** Consumido pelo `proxy.ts` para decidir se a rota exige sessão. */
const paths: ProtectedPath[] = [
  ...groups.flatMap((group) =>
    group.items.map((page) => ({ regex: page.regex, roles: page.roles })),
  ),
  { regex: /^\/$/ },
];

export type { Group, Page, ProtectedPath };
export { groups, paths };
