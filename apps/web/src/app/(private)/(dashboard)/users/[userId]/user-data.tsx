'use client';

import { useQuery } from '@tanstack/react-query';

import { DataContainer, DataField } from '~/components/data';
import { formatters } from '~/libs/formatters';
import { QUERIES } from '~/libs/queries';
import { getUser } from '~/services/users';

const SITUATION_LABELS: Record<number, string> = {
  0: 'Inativo',
  1: 'Ativo',
  2: 'Somente leitura',
};

interface UserDataProps {
  userId: string;
}

/** Bloco de detalhes do colaborador. */
const UserData: React.FC<UserDataProps> = ({ userId }) => {
  const { data, isPending } = useQuery({
    queryKey: [QUERIES.GET_USER, userId],
    queryFn: () => getUser({ userId }),
  });

  return (
    <DataContainer isLoading={isPending}>
      <DataField label="ID" value={data?.user.id} copyable />
      <DataField label="Nome" value={data?.user.name} />
      <DataField label="CPF" value={formatters.cpf(data?.user.cpf, '—')} />
      <DataField label="E-mail" value={formatters.nullable(data?.user.email)} />
      <DataField label="Telefone" value={formatters.phone(data?.user.phone, '—')} />
      <DataField
        label="Data de nascimento"
        value={formatters.calendarDate(data?.user.birthDate, '—')}
      />
      <DataField label="Situação" value={SITUATION_LABELS[data?.user.situation ?? -1] ?? '—'} />
      <DataField label="Cadastrado em" value={formatters.dateTime(data?.user.createdAt, '—')} />
    </DataContainer>
  );
};

export { UserData };
