'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LogOutIcon } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Brand } from '~/components/brand';
import { Screen, ScreenContent, ScreenHeader, ScreenTitle } from '~/components/screen';
import { Button } from '~/components/ui/button';
import { Skeleton } from '~/components/ui/skeleton';
import {
  NETWORK_LABELS,
  OCCUPANCY_LABELS,
  type Occupancy,
  UNIT_TYPE_LABELS,
} from '~/libs/constants';
import { QUERIES } from '~/libs/queries';
import { cn } from '~/libs/utils';
import { getMe } from '~/services/sessions';
import { updateOccupancy } from '~/services/units';

const OCCUPANCY_OPTIONS: { value: Occupancy; dot: string; hint: string }[] = [
  { value: 'low', dot: 'bg-occupancy-low', hint: 'Atendimento sem fila' },
  { value: 'medium', dot: 'bg-occupancy-medium', hint: 'Alguma espera' },
  { value: 'high', dot: 'bg-occupancy-high', hint: 'Fila longa — o app indica outra opção' },
];

/**
 * Área da recepção: troca a lotação da própria unidade. A mudança aparece na
 * tela Unidades dos pacientes em até 10 s (a lista se atualiza sozinha).
 */
const UnitOccupancy: React.FC = () => {
  const queryClient = useQueryClient();

  const { data, isPending } = useQuery({ queryKey: [QUERIES.GET_ME], queryFn: getMe });

  const {
    mutate,
    isPending: isSaving,
    variables,
  } = useMutation({
    mutationFn: updateOccupancy,
    onSuccess: ({ unit }) => {
      queryClient.setQueryData([QUERIES.GET_ME], (current: typeof data) =>
        current ? { ...current, unit } : current,
      );
      queryClient.invalidateQueries({ queryKey: [QUERIES.LIST_UNITS] });
      toast.success(`Lotação atualizada: ${OCCUPANCY_LABELS[unit.occupancy]}`);
    },
    onError: (error) => toast.error(error.message),
  });

  function handleChange(occupancy: Occupancy) {
    if (!data || isSaving || occupancy === data.unit.occupancy) return;

    mutate({ unitId: data.unit.id, occupancy });
  }

  return (
    <Screen>
      <ScreenHeader hideBack className="px-4">
        <Brand />
        <Button asChild variant="ghost" size="sm" className="ml-auto">
          <Link href="/signout">
            <LogOutIcon aria-hidden="true" />
            Sair
          </Link>
        </Button>
      </ScreenHeader>

      <ScreenContent className="pt-4">
        {isPending || !data ? (
          <>
            <Skeleton className="h-16 rounded-md" />
            <Skeleton className="h-60 rounded-lg" />
          </>
        ) : (
          <>
            <div className="flex flex-col gap-1">
              <span className="text-caption text-ink-muted">
                {UNIT_TYPE_LABELS[data.unit.type]} · {NETWORK_LABELS[data.unit.network]}
              </span>
              <ScreenTitle>{data.unit.name}</ScreenTitle>
              <span className="text-body text-ink-muted">Olá, {data.user.name}</span>
            </div>

            <section className="flex flex-col gap-3">
              <h2 id="occupancy-label" className="text-heading text-ink">
                Como está a lotação agora?
              </h2>

              <div
                role="radiogroup"
                aria-labelledby="occupancy-label"
                className="flex flex-col gap-3"
              >
                {OCCUPANCY_OPTIONS.map((option) => {
                  const checked = data.unit.occupancy === option.value;
                  const saving = isSaving && variables?.occupancy === option.value;

                  return (
                    <label
                      key={option.value}
                      className={cn(
                        'flex min-h-16 cursor-pointer items-center gap-4 rounded-md border bg-surface px-4 py-3 transition-colors',
                        'has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-focus-ring',
                        checked
                          ? 'border-2 border-brand-600 bg-surface-tint'
                          : 'border-border-control',
                      )}
                    >
                      <input
                        type="radio"
                        name="occupancy"
                        value={option.value}
                        checked={checked}
                        onChange={() => handleChange(option.value)}
                        disabled={isSaving}
                        className="sr-only"
                      />
                      <span
                        className={cn('size-3 shrink-0 rounded-pill', option.dot)}
                        aria-hidden="true"
                      />
                      <span className="flex flex-1 flex-col">
                        <span className="text-heading text-ink">
                          {OCCUPANCY_LABELS[option.value]}
                        </span>
                        <span className="text-caption text-ink-muted">{option.hint}</span>
                      </span>
                      {(checked || saving) && (
                        <span className="text-caption text-brand-700">
                          {saving ? 'Salvando…' : 'Atual'}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </section>

            <p className="text-caption text-ink-muted">
              Os pacientes veem a mudança na lista de unidades em até 10 segundos.
            </p>
          </>
        )}
      </ScreenContent>
    </Screen>
  );
};

export { UnitOccupancy };
