import { UrgencyBadge } from '~/components/urgency-badge';
import { cn } from '~/libs/utils';

import type { ReadCard } from './unit-cards-store';

/*
 * Cada linha é um botão (seleciona o cartão no detalhe), por isso a tabela é
 * uma grade e não um <table>: o cabeçalho é visual, e o selo já anuncia o
 * nível para o leitor de tela.
 */
const COLUMNS = 'grid grid-cols-[10rem_4.5rem_minmax(0,1fr)_3rem_6.5rem] items-center gap-3';

interface UnitCardsTableProps {
  cards: ReadCard[];
  selectedCode: string | null;
  onSelect: (code: string) => void;
}

const UnitCardsTable: React.FC<UnitCardsTableProps> = ({ cards, selectedCode, onSelect }) => {
  return (
    <section
      aria-label="Pré-triagens a caminho"
      className="overflow-x-auto rounded-lg border bg-surface shadow-card"
    >
      <div className="min-w-[34rem]">
        <div
          aria-hidden="true"
          className={cn(COLUMNS, 'border-b px-4 py-3 text-caption font-bold text-ink-muted')}
        >
          <span>Nível</span>
          <span>Cartão</span>
          <span>Sintomas</span>
          <span>Idade</span>
          <span>Chegada</span>
        </div>

        <ul>
          {cards.map((entry) => {
            const selected = entry.code === selectedCode;

            return (
              <li key={entry.code} className="border-b last:border-b-0">
                <button
                  type="button"
                  onClick={() => onSelect(entry.code)}
                  aria-current={selected ? 'true' : undefined}
                  className={cn(
                    COLUMNS,
                    'min-h-16 w-full cursor-pointer px-4 py-3 text-left transition-colors',
                    selected ? 'bg-surface-tint' : 'hover:bg-surface-subtle',
                  )}
                >
                  <UrgencyBadge level={entry.card.level} className="justify-self-start" />
                  <span className="text-label text-ink">{entry.code}</span>
                  <span className="text-body text-ink">
                    {entry.card.symptoms.join(', ') || entry.card.description || '—'}
                  </span>
                  <span className="text-body text-ink">{entry.card.age ?? '—'}</span>
                  <span className="text-body text-ink">
                    {formatArrival(entry.card.destination?.travelMinutes)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

/** Tempo de deslocamento estimado quando o cartão foi gerado. */
function formatArrival(minutes?: number | null): string {
  if (minutes === null || minutes === undefined) return '—';
  if (minutes === 0) return 'Na recepção';

  return `${minutes} min`;
}

export { UnitCardsTable };
