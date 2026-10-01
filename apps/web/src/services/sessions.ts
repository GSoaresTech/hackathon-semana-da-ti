import { api } from '~/libs/api';
import type { Unit } from '~/services/units';

/*
 * Login da recepção das unidades. O backend devolve o cookie httpOnly `token`
 * — o JavaScript nunca vê o JWT; o `proxy.ts` o verifica no servidor.
 */

type CreateSessionInput = {
  /** Só dígitos, com DDD. */
  phone: string;
  password: string;
};

export async function createSession(input: CreateSessionInput): Promise<void> {
  await api.post('/sessions', input);
}

export async function deleteSession(): Promise<void> {
  await api.delete('/sessions');
}

type GetMeOutput = {
  user: { id: string; name: string; phone: string };
  unit: Unit;
};

export async function getMe(): Promise<GetMeOutput> {
  const { data } = await api.get('/sessions/me');

  return data;
}
