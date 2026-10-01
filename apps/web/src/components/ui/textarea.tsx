import type * as React from 'react';

import { cn } from '~/libs/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex field-sizing-content min-h-24 w-full rounded-sm border border-border-control bg-surface px-4 py-3 text-body text-ink transition-colors placeholder:text-ink-muted disabled:cursor-not-allowed disabled:opacity-60',
        'aria-invalid:border-urg-red',
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
