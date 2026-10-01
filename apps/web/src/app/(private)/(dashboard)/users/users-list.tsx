'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { toast } from 'sonner';

import {
  ListContent,
  ListFooter,
  ListHead,
  ListItem,
  ListItemEmpty,
  ListRoot,
} from '~/components/ui/list';
import { Skeleton } from '~/components/ui/skeleton';
import { formatters } from '~/libs/formatters';
import { QUERIES } from '~/libs/queries';
import { type ListUsersOutput, listUsers, updateUserSituation } from '~/services/users';

import { UsersDropdownMenu } from './users-dropdown-menu';
import { useUsers } from './users-store';

/** Itens por página — precisa bater com o `limit` enviado ao backend. */
const PER_PAGE = 10;

const SITUATION_LABELS: Record<number, string> = {
  0: 'Inativo',
  1: 'Ativo',
  2: 'Somente leitura',
};

const UsersList: React.FC = () => {
  const { page, search, situation, role, setPage } = useUsers();
  const queryClient = useQueryClient();

  const filters = { page, limit: PER_PAGE, search, situation, role };

  // A MESMA variável vai para `queryKey` e para `queryFn`. Montar as duas
  // separadamente é como o cache passa a servir dado de um filtro para outro.
  const queryKey = [QUERIES.LIST_USERS, filters];

  const { data: users, isPending } = useQuery({
    queryKey,
    queryFn: () => listUsers(filters),
  });

  const situationMutation = useMutation({
    mutationFn: updateUserSituation,
    // Patch cirúrgico no cache em vez de `invalidateQueries`: a lista não
    // pisca e o usuário não perde a posição de rolagem por causa de um toggle.
    onSuccess: (_, { userId, situation: newSituation }) => {
      queryClient.setQueryData<ListUsersOutput>(queryKey, (old) => {
        if (!old) return old;

        return {
          ...old,
          data: old.data.map((user) =>
            user.id === userId ? { ...user, situation: newSituation } : user,
          ),
        };
      });
    },
  });

  function handleSituationChange(userId: string, newSituation: number) {
    if (situationMutation.isPending) return;

    const promise = situationMutation.mutateAsync({ userId, situation: newSituation });

    toast.promise(promise, {
      loading: 'Atualizando situação...',
      success: 'Situação atualizada.',
      error: (error) => error.message,
    });
  }

  return (
    <ListRoot cols="grid-cols-[auto_10rem_10rem_8rem_2rem]">
      <ListContent className="mt-8">
        <ListHead>
          <p>Nome</p>
          <p>CPF</p>
          <p>E-mail</p>
          <p>Situação</p>
          <div />
        </ListHead>

        {/*
         * Sempre PER_PAGE linhas: skeleton enquanto carrega, linha vazia
         * quando a página vem incompleta. Isso mantém a altura da lista fixa,
         * então o rodapé de paginação não pula ao trocar de página.
         */}
        {Array.from({ length: PER_PAGE }).map((_, index) => {
          if (isPending) {
            return (
              <ListItem key={index}>
                <Skeleton className="w-40 select-none text-transparent">.</Skeleton>
                <Skeleton className="w-28 select-none text-transparent">.</Skeleton>
                <Skeleton className="w-28 select-none text-transparent">.</Skeleton>
                <Skeleton className="w-20 select-none text-transparent">.</Skeleton>
                <div />
              </ListItem>
            );
          }

          const user = users?.data[index];
          if (!user) return <ListItemEmpty key={index} />;

          return (
            <ListItem key={user.id}>
              <Link href={`/users/${user.id}`} className="truncate font-semibold hover:underline">
                {user.name}
              </Link>
              <p>{formatters.cpf(user.cpf, '—')}</p>
              <p>{formatters.nullable(user.email, '—')}</p>
              <p>{SITUATION_LABELS[user.situation] ?? '—'}</p>

              <UsersDropdownMenu
                user={user}
                onSituationChange={(newSituation) => handleSituationChange(user.id, newSituation)}
              />
            </ListItem>
          );
        })}
      </ListContent>

      <ListFooter
        total={users?.total}
        page={users?.page}
        pages={users?.totalPages}
        perPage={users?.data.length}
        onPageChange={setPage}
      />
    </ListRoot>
  );
};

export { UsersList };
