'use client';

import type { Network } from '~/libs/constants';
import { cn } from '~/libs/utils';

/*
 * Escolha da rede de atendimento (tela Início). Grupo de rádio nativo — as
 * setas do teclado já navegam entre as opções. Ordem fixa: SUS primeiro.
 * O valor vira o filtro `network` de GET /api/units.
 */
const OPTIONS: { value: Network; title: string; subtitle: string }[] = [
  { value: 'public', title: 'SUS', subtitle: 'SAMU, UPA e UBS · gratuito' },
  {
    value: 'private',
    title: 'Tenho plano/particular',
    subtitle: 'Rede credenciada, pronto-socorro ou teleconsulta',
  },
];

interface NetworkSelectorProps {
  value: Network;
  onChange: (value: Network) => void;
  labelledBy?: string;
}

const NetworkSelector: React.FC<NetworkSelectorProps> = ({ value, onChange, labelledBy }) => {
  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className="flex flex-col gap-3">
      {OPTIONS.map((option) => {
        const checked = option.value === value;

        return (
          <label
            key={option.value}
            className={cn(
              'flex min-h-16 cursor-pointer items-center gap-4 rounded-md border bg-surface px-4 py-3 transition-colors',
              'has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-focus-ring',
              checked ? 'border-2 border-brand-600 bg-surface-tint' : 'border-border-control',
            )}
          >
            <input
              type="radio"
              name="network"
              value={option.value}
              checked={checked}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            <span
              aria-hidden="true"
              className={cn(
                'flex size-6 shrink-0 items-center justify-center rounded-pill border-2 bg-surface',
                checked ? 'border-brand-600' : 'border-border-control',
              )}
            >
              {checked && <span className="size-3 rounded-pill bg-brand-600" />}
            </span>
            <span className="flex flex-col">
              <span className="text-heading text-ink">{option.title}</span>
              <span className="text-caption text-ink-muted">{option.subtitle}</span>
            </span>
          </label>
        );
      })}
    </div>
  );
};

export { NetworkSelector };
