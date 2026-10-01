'use client';

import { EyeIcon, EyeOffIcon } from 'lucide-react';
import * as React from 'react';

import { Input } from '~/components/ui/input';
import { cn } from '~/libs/utils';

function PasswordInput({ className, ...props }: React.ComponentProps<'input'>) {
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="relative">
      <Input {...props} type={visible ? 'text' : 'password'} className={cn("pr-12", className)} />

      <button
        type="button"
        tabIndex={-1}
        aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
        onClick={() => setVisible((current) => !current)}
        className="absolute inset-y-0 right-0 flex w-12 cursor-pointer items-center justify-center text-ink-muted transition-colors hover:text-ink"
      >
        {visible ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
      </button>
    </div>
  );
}

export { PasswordInput };
