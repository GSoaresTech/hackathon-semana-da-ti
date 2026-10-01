'use client';

import { XIcon } from 'lucide-react';

import { Badge } from '~/components/ui/badge';
import { ROLES_MAP } from '~/libs/constants';

import { useUsers } from './users-store';

const SITUATION_LABELS: Record<number, string> = {
  0: 'Inativo',
  1: 'Ativo',
  2: 'Somente leitura',
};

/**
 * Chips dos filtros ativos.
 *
 * Existem porque os filtros vivem na store, não na URL: sem um indicador
 * visível, o usuário volta para a tela e não entende por que a lista está
 * curta. Cada chip remove só o seu filtro.
 */
const UsersActiveFilters: React.FC = () => {
  const { search, situation, role, setSearch, setSituation, setRole } = useUsers();

  const chips = [
    search && {
      key: 'search',
      label: `Busca: ${search}`,
      onRemove: () => setSearch(''),
    },
    situation !== null && {
      key: 'situation',
      label: `Situação: ${SITUATION_LABELS[situation] ?? situation}`,
      onRemove: () => setSituation(null),
    },
    role !== null && {
      key: 'role',
      label: `Papel: ${ROLES_MAP[role] ?? role}`,
      onRemove: () => setRole(null),
    },
  ].filter(Boolean) as Array<{ key: string; label: string; onRemove: () => void }>;

  if (!chips.length) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <Badge key={chip.key} variant="secondary" className="gap-1 pr-1">
          {chip.label}
          <button
            type="button"
            onClick={chip.onRemove}
            aria-label={`Remover filtro ${chip.label}`}
            className="cursor-pointer rounded-sm p-0.5 hover:bg-muted-foreground/20"
          >
            <XIcon size={12} />
          </button>
        </Badge>
      ))}
    </div>
  );
};

export { UsersActiveFilters };
