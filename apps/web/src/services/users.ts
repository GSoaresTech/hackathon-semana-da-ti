import { api } from '~/libs/api';
import type { Roles } from '~/libs/constants';
import type { PaginatedResponse } from '~/typings';

/*
 * CAMADA DE SERVIÇO — um arquivo por recurso do backend.
 *
 * Regras:
 * - Toda chamada HTTP do projeto passa por aqui. Componente nunca chama `api`
 *   direto, e nunca importa `axios`.
 * - Tipos `<Verbo><Recurso>Input` / `Output` ficam logo acima da função. Só
 *   exporte o tipo quando outro arquivo precisar dele (ex.: `setQueryData`).
 * - Escreva tudo em camelCase: o interceptor traduz para snake_case no envio e
 *   de volta para camelCase na resposta.
 * - Retorne `data` direto. O tipo declarado é uma afirmação de confiança sobre
 *   o contrato, não uma validação — não há parse de resposta.
 */

type ListUsersInput = {
  page?: number;
  limit?: number;
  search?: string;
  situation?: number | null;
  role?: Roles | null;
};

export type ListUsersOutput = PaginatedResponse<{
  id: string;
  name: string;
  cpf: string;
  email: string | null;
  situation: number;
  createdAt: string;
  updatedAt: string;
}>;

export async function listUsers(input: ListUsersInput): Promise<ListUsersOutput> {
  const { data } = await api.get('/users', {
    params: {
      page: input.page,
      limit: input.limit,
      search: input.search || undefined,
      situation: input.situation ?? undefined,
      role: input.role ?? undefined,
    },
  });

  return data;
}

type GetUserInput = {
  userId: string;
};

export type GetUserOutput = {
  user: {
    id: string;
    name: string;
    cpf: string;
    email: string | null;
    phone: string | null;
    birthDate: string | null;
    situation: number;
    createdAt: string;
    updatedAt: string;
  };
};

export async function getUser({ userId }: GetUserInput): Promise<GetUserOutput> {
  const { data } = await api.get(`/users/${userId}`);

  return data;
}

type CreateUserInput = {
  name: string;
  cpf: string;
  email: string | null;
  phone: string | null;
  password: string;
};

type CreateUserOutput = {
  id: string;
};

export async function createUser(input: CreateUserInput): Promise<CreateUserOutput> {
  const { data } = await api.post('/users', input);

  return data;
}

type UpdateUserInput = {
  userId: string;
  name: string;
  email: string | null;
  phone: string | null;
};

export async function updateUser({ userId, ...input }: UpdateUserInput): Promise<void> {
  await api.patch(`/users/${userId}`, input);
}

type UpdateUserSituationInput = {
  userId: string;
  situation: number;
};

export async function updateUserSituation({
  userId,
  situation,
}: UpdateUserSituationInput): Promise<void> {
  await api.patch(`/users/${userId}`, { situation });
}

type DeleteUserInput = {
  userId: string;
};

export async function deleteUser({ userId }: DeleteUserInput): Promise<void> {
  await api.delete(`/users/${userId}`);
}
