'use client';

import { cn } from '~/libs/utils';

interface IntensityScaleProps {
  value: number | null | undefined;
  onChange: (value: number) => void;
  labelledBy?: string;
}

const STEPS = Array.from({ length: 11 }, (_, index) => index);

/**
 * Escala de intensidade de 0 a 10. Grupo de rádio com 11 células iguais;
 * marcado em brand-600 com texto on-brand. Sempre com as legendas das pontas.
 * Não é pintada de verde a vermelho: cor de urgência só aparece no resultado.
 */
const IntensityScale: React.FC<IntensityScaleProps> = ({ value, onChange, labelledBy }) => {
  return (
    <div className="flex flex-col gap-2">
      <div role="radiogroup" aria-labelledby={labelledBy} className="grid grid-cols-11 gap-1">
        {STEPS.map((step) => {
          const checked = step === value;

          return (
            <label
              key={step}
              className={cn(
                'flex h-12 cursor-pointer items-center justify-center rounded-md border text-label transition-colors',
                'has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-focus-ring',
                checked
                  ? 'border-brand-600 bg-brand-600 text-on-brand'
                  : 'border-border-control bg-surface text-ink hover:bg-surface-subtle',
              )}
            >
              <input
                type="radio"
                name="intensity"
                value={step}
                checked={checked}
                onChange={() => onChange(step)}
                aria-label={
                  step === 0 ? '0, sem dor' : step === 10 ? '10, pior dor possível' : String(step)
                }
                className="sr-only"
              />
              <span aria-hidden="true">{step}</span>
            </label>
          );
        })}
      </div>
      <div className="flex justify-between text-caption text-ink-muted" aria-hidden="true">
        <span>0 · sem dor</span>
        <span>10 · pior possível</span>
      </div>
    </div>
  );
};

export { IntensityScale };
