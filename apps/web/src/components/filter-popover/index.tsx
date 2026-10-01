'use client';

import { FilterIcon } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { cn } from '~/libs/utils';

/**
 * Popover de filtros avançados das listagens.
 *
 * Família de subcomponentes sem Context — aqui é composição pura, porque não há
 * estado a compartilhar entre as partes. Só use Context quando houver.
 *
 *   <FilterPopover>
 *     <FilterPopoverHeader />
 *     <FilterPopoverItems>
 *       <FilterPopoverItem label="Papel">…</FilterPopoverItem>
 *     </FilterPopoverItems>
 *     <FilterPopoverReset onReset={reset} />
 *   </FilterPopover>
 */

const FilterPopover: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <FilterIcon size={16} />
          <span className="hidden sm:block">Filtros</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-72">
        {children}
      </PopoverContent>
    </Popover>
  );
};

const FilterPopoverHeader: React.FC<{ title?: string; description?: string }> = ({
  title = 'Filtros avançados',
  description = 'Refine os resultados da listagem.',
}) => {
  return (
    <div className="mb-4">
      <p className="font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
};

const FilterPopoverItems: React.FC<React.ComponentProps<'div'>> = ({ className, ...props }) => {
  return <div className={cn('flex flex-col gap-4', className)} {...props} />;
};

interface FilterPopoverItemProps {
  label: string;
  children: React.ReactNode;
}

const FilterPopoverItem: React.FC<FilterPopoverItemProps> = ({ label, children }) => {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </div>
  );
};

const FilterPopoverReset: React.FC<{ onReset: () => void }> = ({ onReset }) => {
  return (
    <Button variant="ghost" size="sm" className="mt-4 w-full" onClick={onReset}>
      Limpar filtros
    </Button>
  );
};

export {
  FilterPopover,
  FilterPopoverHeader,
  FilterPopoverItem,
  FilterPopoverItems,
  FilterPopoverReset,
};
