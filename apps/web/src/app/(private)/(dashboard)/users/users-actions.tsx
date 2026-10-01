'use client';

import { PlusIcon, SearchIcon } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import {
  FilterPopover,
  FilterPopoverHeader,
  FilterPopoverItem,
  FilterPopoverItems,
  FilterPopoverReset,
} from '~/components/filter-popover';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { ROLES_OPTIONS, type Roles } from '~/libs/constants';

import { useUsers } from './users-store';

/** Espera de digitação antes de disparar a busca. */
const SEARCH_DEBOUNCE_MS = 300;

const UsersActions: React.FC = () => {
  const { search, situation, role, setSearch, setSituation, setRole, reset } = useUsers();

  // Estado local do input + debounce: sem isso cada tecla vira uma queryKey
  // nova e uma requisição.
  const [term, setTerm] = useState(search);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (term === search) return;

    timeoutRef.current = setTimeout(() => setSearch(term), SEARCH_DEBOUNCE_MS);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [term, search, setSearch]);

  function handleReset() {
    setTerm('');
    reset();
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <SearchIcon
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Buscar por nome ou CPF..."
          className="pl-9"
        />
      </div>

      <FilterPopover>
        <FilterPopoverHeader />

        <FilterPopoverItems>
          <FilterPopoverItem label="Situação">
            <Select
              value={situation === null ? 'all' : String(situation)}
              onValueChange={(value) => setSituation(value === 'all' ? null : Number(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="1">Ativo</SelectItem>
                <SelectItem value="2">Somente leitura</SelectItem>
                <SelectItem value="0">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </FilterPopoverItem>

          <FilterPopoverItem label="Papel">
            <Select
              value={role === null ? 'all' : String(role)}
              onValueChange={(value) => setRole(value === 'all' ? null : (Number(value) as Roles))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {ROLES_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterPopoverItem>
        </FilterPopoverItems>

        <FilterPopoverReset onReset={handleReset} />
      </FilterPopover>

      <Button size="sm" asChild>
        <Link href="/users/new">
          <PlusIcon size={16} />
          <span className="hidden sm:block">Novo colaborador</span>
        </Link>
      </Button>
    </div>
  );
};

export { UsersActions };
