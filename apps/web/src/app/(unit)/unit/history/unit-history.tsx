'use client';

import { HistoryIcon } from 'lucide-react';

import { PanelDescription, PanelHeader, PanelTitle } from '~/components/panel-header';
import { Skeleton } from '~/components/ui/skeleton';
import { UrgencyBadge } from '~/components/urgency-badge';
import { formatters } from '~/libs/formatters';

import { useUnitCards, useUnitCardsHydrated } from '../unit-cards-store';

const UnitHistory: React.FC = () => {
  const hydrated = useUnitCardsHydrated();
  const cards = useUnitCards((state) => state.cards);

  // Mais recente primeiro.
  const called = cards
    .filter((entry) => entry.status === 'called')
    .sort((a, b) => (b.calledAt ?? '').localeCompare(a.calledAt ?? ''));

  return (
    <div className="flex flex-1 flex-col">
      <PanelHeader>
        <div>
          <PanelTitle>Histórico do dia</PanelTitle>
          <PanelDescription>Pacientes chamados para a triagem hoje</PanelDescription>
        </div>
      </PanelHeader>

      {!hydrated ? (
        <Skeleton className="h-60 rounded-lg" />
      ) : called.length > 0 ? (
        <ul className="flex flex-col rounded-lg border bg-surface shadow-card">
          {called.map((entry) => (
            <li
              key={entry.code}
              className="flex min-h-16 flex-wrap items-center gap-x-4 gap-y-2 border-b px-4 py-3 last:border-b-0"
            >
              <UrgencyBadge level={entry.card.level} />
              <span className="text-label text-ink">{entry.code}</span>
              <span className="min-w-0 flex-1 text-body text-ink">
                {entry.card.symptoms.join(', ') || entry.card.description || '—'}
              </span>
              <span className="text-caption text-ink-muted">
                Chamado às {formatters.time(entry.calledAt)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <section className="flex flex-1 flex-col items-center justify-center gap-3 rounded-lg border border-border bg-surface p-10 text-center shadow-card">
          <HistoryIcon aria-hidden="true" className="size-10 text-ink-muted" />
          <h2 className="text-heading text-ink">Nada por aqui ainda</h2>
          <p className="max-w-md text-body text-ink-muted">
            Os pacientes chamados para a triagem hoje aparecem aqui.
          </p>
          <p className="text-caption text-ink-muted">
            A lista fica só neste navegador e some ao fechar a aba.
          </p>
        </section>
      )}
    </div>
  );
};

export { UnitHistory };
