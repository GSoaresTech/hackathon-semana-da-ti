'use client';

import { useQuery } from '@tanstack/react-query';
import { QrCodeIcon } from 'lucide-react';

import { PanelDescription, PanelHeader, PanelTitle } from '~/components/panel-header';
import { Skeleton } from '~/components/ui/skeleton';
import { QUERIES } from '~/libs/queries';
import { getMe } from '~/services/sessions';

const UnitPreTriages: React.FC = () => {
  const { data, isPending } = useQuery({ queryKey: [QUERIES.GET_ME], queryFn: getMe });

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
      </PanelHeader>

      <section className="flex flex-1 flex-col items-center justify-center gap-3 rounded-lg border border-border bg-surface p-10 text-center shadow-card">
        <QrCodeIcon aria-hidden="true" className="size-10 text-ink-muted" />
        <h2 className="text-heading text-ink">Nenhum cartão lido ainda</h2>
        <p className="max-w-md text-body text-ink-muted">
          Quando um paciente mostrar o cartão de triagem, leia o QR code para ver a pré-triagem
          aqui.
        </p>
        <p className="text-caption text-ink-muted">
          Os cartões lidos ficam só neste navegador e somem ao fechar a aba.
        </p>
      </section>
    </div>
  );
};

export { UnitPreTriages };
