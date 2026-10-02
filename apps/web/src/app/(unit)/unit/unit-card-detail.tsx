import { Button } from '~/components/ui/button';
import { UrgencyBadge } from '~/components/urgency-badge';
import { ONSET_LABELS } from '~/libs/constants';
import { formatters } from '~/libs/formatters';

import type { ReadCard } from './unit-cards-store';

interface UnitCardDetailProps {
  entry: ReadCard;
  onCall: (code: string) => void;
}

/** Resumo completo do cartão selecionado, com o alerta orientado e a ação da recepção. */
const UnitCardDetail: React.FC<UnitCardDetailProps> = ({ entry, onCall }) => {
  const { card } = entry;

  const rows = [
    { label: 'Sintomas', value: card.symptoms.join(', ') || null },
    { label: 'Relato', value: card.description ? `“${card.description}”` : null },
    { label: 'Início', value: card.onset ? ONSET_LABELS[card.onset] : null },
    { label: 'Intensidade', value: card.intensity !== null ? `${card.intensity} de 10` : null },
    { label: 'Idade', value: formatters.age(card.age, card.pregnant) },
    { label: 'Destino', value: card.destination?.name ?? null },
  ].filter((row): row is { label: string; value: string } => Boolean(row.value));

  return (
    <article
      aria-label={`Cartão ${entry.code}`}
      className="flex flex-col gap-4 self-start rounded-lg border bg-surface p-5 shadow-card"
    >
      <div className="flex flex-col items-start gap-2">
        <span className="text-caption text-ink-muted">
          Cartão {entry.code} · lido {formatters.time(entry.readAt)}
        </span>
        <UrgencyBadge level={card.level} />
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
        {rows.map((row) => (
          <div key={row.label} className="contents">
            <dt className="text-body text-ink-muted">{row.label}</dt>
            <dd className="text-label text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>

      {card.warningSigns.length > 0 && (
        <section className="rounded-md bg-urg-red-soft px-4 py-3">
          <h2 className="text-label text-urg-red">Alerta orientado</h2>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-body text-ink">
            {card.warningSigns.map((sign) => (
              <li key={sign}>{sign}</li>
            ))}
          </ul>
        </section>
      )}

      <Button type="button" block onClick={() => onCall(entry.code)}>
        Chamar para triagem
      </Button>
    </article>
  );
};

export { UnitCardDetail };
