import { HistoryIcon } from 'lucide-react';

import { PanelDescription, PanelHeader, PanelTitle } from '~/components/panel-header';

const UnitHistory: React.FC = () => {
  return (
    <div className="flex flex-1 flex-col">
      <PanelHeader>
        <div>
          <PanelTitle>Histórico do dia</PanelTitle>
          <PanelDescription>Pacientes chamados para a triagem hoje</PanelDescription>
        </div>
      </PanelHeader>

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
    </div>
  );
};

export { UnitHistory };
