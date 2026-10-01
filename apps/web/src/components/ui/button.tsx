import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import type * as React from 'react';

import { cn } from '~/libs/utils';

/*
 * Button do design system (tr-btn).
 *
 * - primary: uma por tela, no rodapé; avança o fluxo.
 * - secondary: ação alternativa (ex.: "Ver no mapa").
 * - ghost: ação discreta (ex.: "Voltar").
 * - block: ocupa a largura toda (padrão do rodapé no celular).
 *
 * Altura mínima de 48px (alvo de toque). Desabilitado enquanto faltar resposta
 * obrigatória. O texto é verbo no imperativo, em caixa normal.
 */
const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md text-label whitespace-nowrap transition-colors select-none disabled:pointer-events-none aria-disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        primary:
          'bg-brand-600 text-on-brand hover:bg-brand-700 active:bg-brand-700 disabled:bg-border disabled:text-ink-muted',
        secondary:
          'border-2 border-brand-600 bg-surface text-brand-700 hover:bg-surface-tint disabled:border-border disabled:text-ink-muted',
        ghost: 'text-brand-700 hover:bg-surface-tint disabled:text-ink-muted',
      },
      size: {
        default: 'min-h-12 px-5 py-3',
        sm: 'min-h-10 px-4 py-2',
        icon: 'size-12',
      },
      block: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
      block: false,
    },
  },
);

function Button({
  className,
  variant = 'primary',
  size = 'default',
  block = false,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, block, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
