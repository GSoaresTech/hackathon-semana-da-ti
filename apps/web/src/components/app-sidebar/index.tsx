'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '~/components/ui/sidebar';
import { useSession } from '~/hooks/use-session';
import { canAccess } from '~/libs/access';
import { groups } from '~/libs/pages';

import { AppSidebarUser } from './user-section';

/**
 * Navegação lateral.
 *
 * Os itens vêm de `~/libs/pages` — a mesma árvore que o `proxy.ts` usa para
 * proteger rotas. Uma fonte só: registrar a rota lá já a coloca no menu e sob
 * proteção, sem risco de menu e guarda discordarem.
 */
const AppSidebar: React.FC = () => {
  const pathname = usePathname();
  const { data } = useSession();

  const visibleGroups = groups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (page) => !page.hidden && canAccess(page, { role: data?.session.role }),
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-3">
        <span className="text-base font-bold text-foreground">RH</span>
      </SidebarHeader>

      <SidebarContent>
        {visibleGroups.map((group) => (
          <SidebarGroup key={group.id}>
            {group.title && <SidebarGroupLabel>{group.title}</SidebarGroupLabel>}

            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((page) => {
                  const Icon = page.icon;

                  return (
                    <SidebarMenuItem key={page.id}>
                      <SidebarMenuButton asChild isActive={page.regex.test(pathname)}>
                        <Link href={page.url}>
                          {Icon && <Icon size={16} />}
                          <span>{page.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <AppSidebarUser />
    </Sidebar>
  );
};

export { AppSidebar };
