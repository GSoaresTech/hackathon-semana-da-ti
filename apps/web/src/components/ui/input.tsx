import type * as React from 'react';

import { cn } from '~/libs/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-12 w-full min-w-0 rounded-sm border border-border-control bg-surface px-4 text-body text-ink transition-colors placeholder:text-ink-muted disabled:cursor-not-allowed disabled:opacity-60',
        'aria-invalid:border-urg-red',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
