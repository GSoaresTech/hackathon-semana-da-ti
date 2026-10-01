'use client';

import { MoreVerticalIcon } from 'lucide-react';
import Link from 'next/link';

import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';

interface UsersDropdownMenuProps {
  user: { id: string; name: string; situation: number };
  onSituationChange: (situation: number) => void;
}

/** Ações por linha da listagem. */
const UsersDropdownMenu: React.FC<UsersDropdownMenuProps> = ({ user, onSituationChange }) => {
  const isActive = user.situation === 1;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-7">
          <MoreVerticalIcon size={16} />
          <span className="sr-only">Ações de {user.name}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/users/${user.id}`}>Ver detalhes</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/users/${user.id}/edit`}>Editar</Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onSelect={() => onSituationChange(isActive ? 0 : 1)}>
          {isActive ? 'Inativar' : 'Ativar'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { UsersDropdownMenu };
