'use client';

import { useQuery } from '@tanstack/react-query';
import { ClipboardListIcon, GaugeIcon, HistoryIcon, LogOutIcon } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Brand } from '~/components/brand';
import { EmergencyButton } from '~/components/emergency-button';
import { Button } from '~/components/ui/button';
import { Skeleton } from '~/components/ui/skeleton';
import { QUERIES } from '~/libs/queries';
import { cn } from '~/libs/utils';
import { getMe } from '~/services/sessions';

/*
 * Esqueleto do painel da unidade (tela 08 do PDF).
 *
 * Desktop (lg+): menu lateral fixo de 256px, área principal com `p-8`.
 * Celular: cabeçalho com marca + "Sair" + 192, e os três itens como abas
 * horizontais. "Emergência 192" aparece em todas as telas do painel.
 */

type NavItem = {
  label: string;
  href: Route;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Pré-triagens',
    href: '/unit',
    description: 'Pacientes a caminho com cartão',
    icon: ClipboardListIcon,
  },
  {
    label: 'Lotação',
    href: '/unit/occupancy',
    description: 'Como está a espera agora',
    icon: GaugeIcon,
  },
  {
    label: 'Histórico do dia',
    href: '/unit/history',
    description: 'Pacientes chamados hoje',
    icon: HistoryIcon,
  },
];

interface UnitShellProps {
  children: React.ReactNode;
}

const UnitShell: React.FC<UnitShellProps> = ({ children }) => {
  const pathname = usePathname();
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: [QUERIES.GET_ME],
    queryFn: getMe,
  });

  const unitName = data?.unit.name;
  const userName = data?.user.name;

  return (
    <div className="flex min-h-dvh flex-col bg-surface-subtle lg:flex-row">
      <header className="flex flex-col gap-3 border-border border-b bg-surface px-4 pt-3 pb-0 lg:hidden">
        <div className="flex items-center gap-3">
          <Brand />
          <EmergencyButton variant="compact" className="ml-auto" />
          <Button asChild variant="ghost" size="sm">
            <Link href="/signout">
              <LogOutIcon aria-hidden="true" />
              Sair
            </Link>
          </Button>
        </div>
        <UnitNavigation pathname={pathname} orientation="horizontal" />
      </header>

      <aside className="hidden w-64 shrink-0 flex-col border-border border-r bg-surface lg:flex">
        <div className="flex flex-col gap-1 px-6 pt-6 pb-4">
          <Brand />
          <span className="text-caption text-ink-muted">Painel da unidade</span>
        </div>
        <UnitNavigation pathname={pathname} orientation="vertical" />
        <div className="mt-auto flex flex-col gap-3 border-border border-t px-6 py-4">
          {isPending ? (
            <>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-28" />
            </>
          ) : (
            <>
              <span className="truncate text-label text-ink" title={unitName}>
                {unitName ?? 'Unidade'}
              </span>
              <span className="truncate text-caption text-ink-muted" title={userName}>
                {userName ?? '—'}
              </span>
            </>
          )}
          <EmergencyButton variant="compact" className="self-start" />
          <Button asChild variant="ghost" size="sm" className="self-start">
            <Link href="/signout">
              <LogOutIcon aria-hidden="true" />
              Sair
            </Link>
          </Button>
        </div>
      </aside>

      <main className="flex flex-1 flex-col px-4 py-6 lg:px-8 lg:py-8">
        {isError ? (
          <div className="flex flex-col items-start gap-3 rounded-lg border border-border bg-surface p-6 shadow-card">
            <p className="text-body text-ink">
              Não foi possível carregar os dados da unidade agora.
            </p>
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              Tentar de novo
            </Button>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
};

interface UnitNavigationProps {
  pathname: string;
  orientation: 'vertical' | 'horizontal';
}

const UnitNavigation: React.FC<UnitNavigationProps> = ({ pathname, orientation }) => {
  return (
    <nav
      aria-label="Seções do painel"
      className={cn(
        orientation === 'vertical'
          ? 'flex flex-col gap-1 px-3'
          : '-mx-4 flex gap-1 overflow-x-auto px-4 pb-2',
      )}
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'inline-flex min-h-12 items-center gap-3 rounded-md px-3 py-2 text-label text-ink-muted transition-colors hover:bg-surface-tint hover:text-ink',
              orientation === 'horizontal' && 'shrink-0',
              isActive && 'bg-surface-tint font-extrabold text-brand-700',
            )}
          >
            <Icon aria-hidden="true" className="size-5" />
            <span>{item.label}</span>
            {orientation === 'vertical' && <span className="sr-only"> — {item.description}</span>}
          </Link>
        );
      })}
    </nav>
  );
};

export { UnitShell };
