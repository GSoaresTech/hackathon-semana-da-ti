'use client';

import { LogOutIcon } from 'lucide-react';
import Link from 'next/link';

import { SidebarFooter } from '~/components/ui/sidebar';
import { Skeleton } from '~/components/ui/skeleton';
import { useSession } from '~/hooks/use-session';
import { ROLES_MAP } from '~/libs/constants';

const AppSidebarUser: React.FC = () => {
  const { data, isPending } = useSession();

  return (
    <SidebarFooter className="border-t p-4">
      {isPending ? (
        <Skeleton className="h-9 w-full" />
      ) : (
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {ROLES_MAP[data?.session.role ?? 4] ?? 'Colaborador'}
            </p>
            <p className="truncate text-xs text-muted-foreground">Sessão ativa</p>
          </div>

          <Link
            href="/signout"
            aria-label="Sair"
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
          >
            <LogOutIcon size={16} />
          </Link>
        </div>
      )}
    </SidebarFooter>
  );
};

export { AppSidebarUser };
