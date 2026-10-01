'use client';

import { ChevronDownIcon, NavigationIcon, PhoneIcon } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { NETWORK_LABELS, OCCUPANCY_LABELS, type Occupancy } from '~/libs/constants';
import { formatters } from '~/libs/formatters';
import { cn } from '~/libs/utils';
import type { ListedUnit } from '~/services/units';

const OCCUPANCY_DOT: Record<Occupancy, string> = {
  low: 'bg-occupancy-low',
  medium: 'bg-occupancy-medium',
  high: 'bg-occupancy-high',
};

interface UnitCardProps {
  unit: ListedUnit;
  /** Card selecionado mostra as ações e os detalhes. */
  selected: boolean;
  onSelect: () => void;
  /** "Como chegar" também define este destino no cartão de triagem. */
  onGo: () => void;
}

/**
 * Unidade de atendimento da tela Unidades: rede, lotação (ponto + palavra),
 * distância e tempo. Etiqueta "SUS" ou "Plano".
 */
const UnitCard: React.FC<UnitCardProps> = ({ unit, selected, onSelect, onGo }) => {
  const isTelemedicine = unit.type === 'telemedicine';

  return (
    <article
      className={cn(
        'rounded-lg border bg-surface shadow-card transition-colors',
        selected && 'border-brand-600',
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-expanded={selected}
        className="flex w-full cursor-pointer flex-col gap-2 rounded-lg px-4 pt-4 pb-3 text-left"
      >
        <span className="flex items-start justify-between gap-3">
          <span className="text-heading text-ink">{unit.name}</span>
          <NetworkTag network={unit.network} />
        </span>

        <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-ink-muted">
          <span className="inline-flex items-center gap-1.5 text-label text-ink">
            <span className={cn('size-2.5 rounded-pill', OCCUPANCY_DOT[unit.occupancy])} />
            {isTelemedicine && unit.occupancy === 'low'
              ? 'Sem fila'
              : OCCUPANCY_LABELS[unit.occupancy]}
          </span>
          {isTelemedicine ? (
            <span>Online agora</span>
          ) : (
            <>
              {unit.distanceKm !== null && <span>{formatters.distance(unit.distanceKm)}</span>}
              {unit.travelMinutes !== null && <span>{unit.travelMinutes} min de carro</span>}
            </>
          )}
          <span>{unit.openingHours}</span>
          {!selected && (
            <ChevronDownIcon className="ml-auto size-5 text-ink-muted" aria-hidden="true" />
          )}
        </span>
      </button>

      {selected && (
        <div className="flex flex-col gap-3 px-4 pb-4">
          {(unit.address || unit.phone) && (
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-caption">
              {unit.address && (
                <>
                  <dt className="text-ink-muted">Endereço</dt>
                  <dd className="text-ink">
                    {unit.address}
                    {unit.neighborhood && ` · ${unit.neighborhood}`}
                  </dd>
                </>
              )}
              {unit.phone && (
                <>
                  <dt className="text-ink-muted">Telefone</dt>
                  <dd className="text-ink">{formatters.phone(unit.phone, unit.phone)}</dd>
                </>
              )}
            </dl>
          )}

          <div className="grid grid-cols-2 gap-2">
            {isTelemedicine ? (
              <Button asChild size="sm" onClick={onGo} className="col-span-2">
                <a href={`tel:${unit.phone ?? ''}`}>
                  <PhoneIcon aria-hidden="true" />
                  Ligar para a teleconsulta
                </a>
              </Button>
            ) : (
              <>
                <Button asChild size="sm" onClick={onGo}>
                  <a href={directionsUrl(unit)} target="_blank" rel="noreferrer">
                    <NavigationIcon aria-hidden="true" />
                    Como chegar
                  </a>
                </Button>
                {unit.phone ? (
                  <Button asChild size="sm" variant="secondary">
                    <a href={`tel:${unit.phone}`}>
                      <PhoneIcon aria-hidden="true" />
                      Ligar
                    </a>
                  </Button>
                ) : (
                  <span />
                )}
              </>
            )}
          </div>
        </div>
      )}
    </article>
  );
};

const NetworkTag: React.FC<{ network: ListedUnit['network'] }> = ({ network }) => {
  return (
    <span
      className={cn(
        'shrink-0 rounded-sm px-2 py-0.5 text-caption text-on-brand',
        network === 'public' ? 'bg-network-public' : 'bg-network-private',
      )}
    >
      {NETWORK_LABELS[network]}
    </span>
  );
};

function directionsUrl(unit: ListedUnit): string {
  const destination =
    unit.lat !== null && unit.lng !== null
      ? `${unit.lat},${unit.lng}`
      : `${unit.name} ${unit.address ?? ''} Caruaru PE`;

  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}

export { NetworkTag, UnitCard };
