'use client';

import { cn } from '~/libs/utils';

interface OptionGroupProps<T extends string> {
  name: string;
  options: { value: T; label: string }[];
  value: T | undefined;
  onChange: (value: T) => void;
  labelledBy?: string;
  className?: string;
}

/**
 * Pergunta de resposta única em botões lado a lado ("Há quanto tempo
 * começou?", "Está gestante?"). Grupo de rádio nativo: setas navegam.
 * Marcado: fundo surface-tint e contorno brand-600, como as demais seleções.
 */
function OptionGroup<T extends string>({
  name,
  options,
  value,
  onChange,
  labelledBy,
  className,
}: OptionGroupProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      className={cn('grid auto-cols-fr grid-flow-col gap-2', className)}
    >
      {options.map((option) => {
        const checked = option.value === value;

        return (
          <label
            key={option.value}
            className={cn(
              'flex min-h-12 cursor-pointer items-center justify-center rounded-md border px-2 py-2 text-center text-label transition-colors',
              'has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-focus-ring',
              checked
                ? 'border-2 border-brand-600 bg-surface-tint text-brand-700'
                : 'border-border-control bg-surface text-ink hover:bg-surface-subtle',
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={checked}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.label}
          </label>
        );
      })}
    </div>
  );
}

export { OptionGroup };
