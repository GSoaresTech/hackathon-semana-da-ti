'use client';

import { CheckIcon, CopyIcon } from 'lucide-react';
import { createContext, useContext, useState } from 'react';

import { Skeleton } from '~/components/ui/skeleton';
import { cn } from '~/libs/utils';

/**
 * Bloco rótulo/valor das telas de detalhe.
 *
 * Mesmo padrão de subcomponentes do `~/components/ui/list`: o `isLoading` fica
 * num Context do módulo, então cada `DataField` sabe sozinho se deve mostrar
 * skeleton — sem repetir a prop em campo por campo.
 *
 *   <DataContainer isLoading={query.isPending}>
 *     <DataField label="Nome" value={data?.user.name} />
 *     <DataField label="CPF" value={formatters.cpf(data?.user.cpf)} copyable />
 *   </DataContainer>
 */

const DataContainerContext = createContext<{ isLoading: boolean }>({ isLoading: false });

interface DataContainerProps {
  isLoading?: boolean;
  children: React.ReactNode;
  className?: string;
}

const DataContainer: React.FC<DataContainerProps> = ({
  isLoading = false,
  children,
  className,
}) => {
  return (
    <DataContainerContext.Provider value={{ isLoading }}>
      <ul className={cn('mt-4 flex flex-col text-sm', className)}>{children}</ul>
    </DataContainerContext.Provider>
  );
};

interface DataFieldProps {
  label: string;
  value?: React.ReactNode;
  copyable?: boolean;
}

const DataField: React.FC<DataFieldProps> = ({ label, value, copyable }) => {
  const { isLoading } = useContext(DataContainerContext);
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (!copyable || isLoading) return;
    if (typeof value !== 'string' && typeof value !== 'number') return;

    navigator.clipboard.writeText(String(value)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <li className="grid items-center gap-4 border-b border-border py-2.5 md:grid-cols-[18rem_auto]">
      <span className="text-muted-foreground">{label}</span>

      {isLoading ? (
        <Skeleton className="w-max select-none text-transparent">Lorem ipsum dolor sit</Skeleton>
      ) : (
        <span
          onClick={handleCopy}
          className={cn(
            'font-semibold text-foreground',
            copyable && 'inline-flex cursor-pointer select-none items-center gap-1.5',
          )}
        >
          {value}
          {copyable &&
            (copied ? (
              <CheckIcon className="size-3.5 text-green-600" />
            ) : (
              <CopyIcon className="size-3.5 text-muted-foreground" />
            ))}
        </span>
      )}
    </li>
  );
};

export { DataContainer, DataField };
