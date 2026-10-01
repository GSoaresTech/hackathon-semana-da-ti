'use client';

import { CheckIcon } from 'lucide-react';

import { cn } from '~/libs/utils';

interface SymptomChipProps {
  label: string;
  pressed: boolean;
  onPressedChange: (pressed: boolean) => void;
}

/**
 * Chip de sintoma pré-definido; vários podem ser marcados. Botão alternável
 * com `aria-pressed`. Marcado: fundo surface-tint, contorno brand-600 e um ✓
 * — a seleção não depende só da cor.
 */
const SymptomChip: React.FC<SymptomChipProps> = ({ label, pressed, onPressedChange }) => {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={() => onPressedChange(!pressed)}
      className={cn(
        'inline-flex min-h-12 cursor-pointer items-center gap-1 rounded-pill border px-4 py-3 text-label transition-colors',
        pressed
          ? 'border-2 border-brand-600 bg-surface-tint text-brand-700'
          : 'border-border-control bg-surface text-ink hover:bg-surface-subtle',
      )}
    >
      {pressed && <CheckIcon className="size-4" aria-hidden="true" />}
      {label}
    </button>
  );
};

const SymptomChipList: React.FC<React.ComponentProps<'div'>> = ({ className, ...props }) => {
  return <div className={cn('flex flex-wrap gap-2', className)} {...props} />;
};

export { SymptomChip, SymptomChipList };
