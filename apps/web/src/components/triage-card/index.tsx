import { QRCodeSVG } from 'qrcode.react';

import { UrgencyBadge } from '~/components/urgency-badge';
import { ONSET_LABELS } from '~/libs/constants';
import { formatters } from '~/libs/formatters';
import { cn } from '~/libs/utils';
import type { Card, CardSummary } from '~/services/cards';

/*
 * O QR precisa de cor literal (é exportado como imagem pelo "Salvar imagem").
 * Espelha os tokens ink e surface — sempre ink sobre surface, com margem branca.
 */
const QR_INK = '#0f2a44';
const QR_SURFACE = '#ffffff';

interface TriageCardProps {
  card: Card;
  summary: CardSummary;
  className?: string;
}

/**
 * Cartão de triagem para mostrar na recepção. O QR carrega o token assinado
 * de POST /api/cards; o resumo vai dentro do próprio token — nada de saúde é
 * salvo em banco.
 */
const TriageCard: React.FC<TriageCardProps> = ({ card, summary, className }) => {
  const rows = [
    { label: 'Sintomas', value: summary.symptoms.join(', ') || summary.description || '—' },
    { label: 'Início', value: summary.onset ? ONSET_LABELS[summary.onset] : null },
    {
      label: 'Intensidade',
      value: summary.intensity !== null ? `${summary.intensity} de 10` : null,
    },
    { label: 'Idade', value: formatAge(summary) },
  ].filter((row): row is { label: string; value: string } => Boolean(row.value));

  return (
    <article
      className={cn(
        'flex flex-col items-center gap-4 rounded-lg border bg-surface p-4 shadow-card',
        className,
      )}
    >
      <div className="rounded-md border bg-surface p-3">
        <QRCodeSVG
          value={card.token}
          size={176}
          level="M"
          marginSize={2}
          fgColor={QR_INK}
          bgColor={QR_SURFACE}
          title={`Cartão de triagem ${card.code}`}
        />
      </div>

      {summary.destination && (
        <div className="flex flex-col items-center">
          <span className="text-caption text-ink-muted">Destino</span>
          <span className="text-heading text-ink">{summary.destination.name}</span>
        </div>
      )}

      <hr className="w-full border-t border-dashed border-border-control" />

      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <UrgencyBadge level={summary.level} />
        <span className="text-caption text-ink-muted">
          {card.code} · gerado {formatters.time(card.issuedAt)} · válido 12 h
        </span>
      </div>

      <dl className="grid w-full grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
        {rows.map((row) => (
          <div key={row.label} className="contents">
            <dt className="text-body text-ink-muted">{row.label}</dt>
            <dd className="text-label text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
};

function formatAge(summary: CardSummary): string | null {
  if (summary.age === null) return null;

  const pregnancy =
    summary.pregnant === 'yes' ? ' · gestante' : summary.pregnant === 'no' ? ' · não gestante' : '';

  return `${summary.age} anos${pregnancy}`;
}

export { TriageCard };
