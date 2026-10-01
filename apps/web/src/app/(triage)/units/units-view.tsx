'use client';

import { useQuery } from '@tanstack/react-query';
import { ChevronLeftIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { EmergencyButton } from '~/components/emergency-button';
import { ScreenFooter } from '~/components/screen';
import { Button } from '~/components/ui/button';
import { Skeleton } from '~/components/ui/skeleton';
import { UnitCard } from '~/components/unit-card';
import { UnitsMap } from '~/components/units-map';
import { UrgencyBadge } from '~/components/urgency-badge';
import {
  DEFAULT_COORDS,
  type Network,
  UNIT_TYPE_LABELS,
  type UnitType,
  type UrgencyLevel,
} from '~/libs/constants';
import { QUERIES } from '~/libs/queries';
import { cn } from '~/libs/utils';
import { listUnits } from '~/services/units';

import { useTriage } from '../triage-store';
import { useTriageGuard } from '../use-triage-guard';

/** A lotação muda ao vivo na demo: a lista se atualiza sozinha. */
const REFETCH_INTERVAL_MS = 10_000;

const NETWORK_OPTIONS: { value: Network; label: string }[] = [
  { value: 'public', label: 'SUS' },
  { value: 'private', label: 'Plano' },
];

interface UnitsViewProps {
  /** Veio da tela de Emergência: mostra as unidades de nível 1. */
  emergencyLevel: boolean;
}

/**
 * Tela 06 · Unidades — SUS e plano. O mesmo motor, duas redes: o nível decide
 * o tipo de unidade, e a lista vem ordenada por lotação e distância.
 */
const UnitsView: React.FC<UnitsViewProps> = ({ emergencyLevel }) => {
  const ready = useTriageGuard((state) => emergencyLevel || state.result !== null);
  const result = useTriage((state) => state.result);
  const network = useTriage((state) => state.network);
  const coords = useTriage((state) => state.coords);
  const setNetwork = useTriage((state) => state.setNetwork);
  const setDestination = useTriage((state) => state.setDestination);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const level: UrgencyLevel = emergencyLevel ? 1 : (result?.level ?? 3);
  const origin = coords ?? DEFAULT_COORDS;

  const { data, isPending } = useQuery({
    queryKey: [QUERIES.LIST_UNITS, { level, network, ...origin }],
    queryFn: () => listUnits({ level, network, lat: origin.lat, lng: origin.lng }),
    enabled: ready,
    refetchInterval: REFETCH_INTERVAL_MS,
    staleTime: 0,
  });

  const units = data?.units ?? [];
  const activeId = selectedId ?? units[0]?.id ?? null;
  const typesLabel = describeTypes(units.map((unit) => unit.type));

  function handleNetwork(value: Network) {
    setSelectedId(null);
    setNetwork(value);
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[440px] flex-col bg-surface-subtle">
      {/* `isolate`: os panes do Leaflet (z-index 400–700) ficam presos aqui dentro e não cobrem a lista. */}
      <div className="relative isolate h-64 shrink-0">
        {ready && (
          <UnitsMap origin={origin} units={units} selectedId={activeId} onSelect={setSelectedId} />
        )}
        {/* Acima dos panes do Leaflet (z-index 400–700). */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[1000] flex items-center justify-between p-4">
          <Link
            href={emergencyLevel ? '/emergency' : '/result'}
            aria-label="Voltar"
            className="pointer-events-auto flex size-12 items-center justify-center rounded-pill bg-surface text-ink shadow-card transition-colors hover:bg-surface-tint"
          >
            <ChevronLeftIcon className="size-6" aria-hidden="true" />
          </Link>
          <EmergencyButton variant="compact" className="pointer-events-auto" />
        </div>
      </div>

      <section className="relative z-10 -mt-5 flex flex-1 flex-col gap-4 rounded-t-lg bg-surface-subtle px-4 pt-3 pb-6">
        <span className="mx-auto h-1 w-10 rounded-pill bg-border" aria-hidden="true" />

        <header className="flex items-center justify-between gap-3">
          <h1 className="text-heading text-ink">Unidades indicadas</h1>
          <UrgencyBadge level={level} />
        </header>

        <div className="flex flex-wrap items-center gap-2">
          <div role="radiogroup" aria-label="Rede de atendimento" className="flex gap-1.5">
            {NETWORK_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={cn(
                  'flex min-h-10 cursor-pointer items-center rounded-pill border px-3 text-caption transition-colors',
                  'has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-focus-ring',
                  option.value === network
                    ? 'border-brand-600 bg-brand-600 text-on-brand'
                    : 'border-border-control bg-surface text-ink',
                )}
              >
                <input
                  type="radio"
                  name="units-network"
                  value={option.value}
                  checked={option.value === network}
                  onChange={() => handleNetwork(option.value)}
                  className="sr-only"
                />
                {option.value === network && typesLabel
                  ? `${typesLabel} · ${option.label}`
                  : option.label}
              </label>
            ))}
          </div>
          <span className="rounded-pill border border-border-control bg-surface px-3 py-2 text-caption text-ink">
            Por lotação e distância
          </span>
        </div>

        {data?.notice && (
          <p className="rounded-md bg-surface-tint px-4 py-3 text-body text-brand-700">
            {data.notice}
          </p>
        )}

        <div className="flex flex-col gap-3" aria-live="polite" aria-busy={isPending}>
          {(isPending || !ready) &&
            ['unit-1', 'unit-2', 'unit-3'].map((key) => (
              <Skeleton key={key} className="h-24 rounded-lg" />
            ))}

          {!isPending && units.length === 0 && (
            <p className="rounded-md bg-surface px-4 py-6 text-center text-body text-ink-muted">
              Nenhuma unidade encontrada para esta rede. Em caso de dúvida, ligue 192.
            </p>
          )}

          {units.map((unit) => (
            <UnitCard
              key={unit.id}
              unit={unit}
              selected={unit.id === activeId}
              onSelect={() => setSelectedId(unit.id)}
              onGo={() => setDestination({ id: unit.id, name: unit.name })}
            />
          ))}
        </div>
      </section>

      {result && !emergencyLevel && (
        <ScreenFooter className="pt-4">
          <Button asChild block variant="secondary">
            <Link href="/card">Gerar cartão de triagem</Link>
          </Button>
        </ScreenFooter>
      )}
    </main>
  );
};

/** "UPA", "Pronto-socorro" — os tipos presentes na lista, na ordem em que aparecem. */
function describeTypes(types: UnitType[]): string {
  const unique = [...new Set(types.filter((type) => type !== 'telemedicine'))];

  return unique.map((type) => UNIT_TYPE_LABELS[type]).join(', ');
}

export { UnitsView };
