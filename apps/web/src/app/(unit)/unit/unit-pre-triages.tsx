'use client';

import { useQuery } from '@tanstack/react-query';
import { QrCodeIcon } from 'lucide-react';
import { toast } from 'sonner';

import { PanelActions, PanelDescription, PanelHeader, PanelTitle } from '~/components/panel-header';
import { Skeleton } from '~/components/ui/skeleton';
import { QUERIES } from '~/libs/queries';
import { getMe } from '~/services/sessions';

import { UnitCardDetail } from './unit-card-detail';
import { UnitCardForm } from './unit-card-form';
import { sortByUrgency, useUnitCards, useUnitCardsHydrated } from './unit-cards-store';
import { UnitCardsTable } from './unit-cards-table';

const UnitPreTriages: React.FC = () => {
  const { data, isPending } = useQuery({ queryKey: [QUERIES.GET_ME], queryFn: getMe });

  const hydrated = useUnitCardsHydrated();
  const cards = useUnitCards((state) => state.cards);
  const selectedCode = useUnitCards((state) => state.selectedCode);
  const selectCard = useUnitCards((state) => state.selectCard);
  const callCard = useUnitCards((state) => state.callCard);

  const waiting = sortByUrgency(cards.filter((entry) => entry.status === 'waiting'));
  const selected = waiting.find((entry) => entry.code === selectedCode) ?? waiting[0];

  function handleCall(code: string) {
    callCard(code);
    toast.success(`Cartão ${code} chamado para a triagem`);
  }

  return (
    <div className="flex flex-1 flex-col">
      <PanelHeader>
        <div>
          {isPending || !data ? (
            <Skeleton className="h-7 w-72" />
          ) : (
            <PanelTitle>{data.unit.name}</PanelTitle>
          )}
          <PanelDescription>Recepção · pacientes a caminho com pré-triagem</PanelDescription>
        </div>
        <PanelActions>
          <UnitCardForm />
        </PanelActions>
      </PanelHeader>

      {!hydrated ? (
        <Skeleton className="h-72 rounded-lg" />
      ) : selected ? (
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <UnitCardsTable cards={waiting} selectedCode={selected.code} onSelect={selectCard} />
          <UnitCardDetail entry={selected} onCall={handleCall} />
        </div>
      ) : (
        <section className="flex flex-1 flex-col items-center justify-center gap-3 rounded-lg border border-border bg-surface p-10 text-center shadow-card">
          <QrCodeIcon aria-hidden="true" className="size-10 text-ink-muted" />
          <h2 className="text-heading text-ink">Nenhum cartão lido ainda</h2>
          <p className="max-w-md text-body text-ink-muted">
            Quando um paciente mostrar o cartão de triagem, cole o link do cartão acima para ver a
            pré-triagem aqui.
          </p>
          <p className="text-caption text-ink-muted">
            Os cartões lidos ficam só neste navegador e somem ao fechar a aba.
          </p>
        </section>
      )}
    </div>
  );
};

export { UnitPreTriages };
