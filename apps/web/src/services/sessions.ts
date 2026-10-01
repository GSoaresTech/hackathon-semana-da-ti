import { api } from '~/libs/api';
import type { Roles } from '~/libs/constants';

/**
 * Autenticação — contrato do idh-server.
 *
 * O login tem DOIS passos, porque um usuário pode ter mais de um perfil
 * (empresa/estabelecimento) e a sessão é sempre de um perfil específico:
 *
 *   1. POST /sessions/authenticate  { cpf, password }  → cookie `authorization`
 *   2. GET  /users/me/profiles                         → perfis disponíveis
 *   3. POST /sessions               { profileId }      → cookie `token`
 *
 * Os dois cookies são httpOnly: o JavaScript nunca vê o token. Por isso a
 * sessão é lida pelo handler `/session`, que roda no servidor.
 */

type AuthenticateCredentialsInput = {
  cpf: string;
  password: string;
};

export async function authenticateCredentials(input: AuthenticateCredentialsInput): Promise<void> {
  await api.post('/sessions/authenticate', input);
}

type ListSelfProfilesOutput = {
  profiles: Array<{
    id: string;
    role: Roles;
    situation: number;
    companyId: string | null;
    companyName: string | null;
  }>;
};

export async function listSelfProfiles(): Promise<ListSelfProfilesOutput> {
  const { data } = await api.get('/users/me/profiles');

  return data;
}

type CreateSessionInput = {
  profileId: string;
};

export async function createSession(input: CreateSessionInput): Promise<void> {
  // O interceptor converte `profileId` → `profile_id` no envio.
  await api.post('/sessions', input);
}

export async function deleteSession(): Promise<void> {
  await api.delete('/sessions');
}

export type GetSessionOutput = {
  session: {
    userId: string;
    profileId: string;
    companyId: string | null;
    role: Roles;
    situation: number;
    installationId: string | null;
  };
};

/**
 * Lê a sessão do handler local `/session` (não do backend). O `baseURL: '/'`
 * sobrescreve o `/api` padrão do axios só nesta chamada.
 */
export async function getSession(): Promise<GetSessionOutput> {
  const { data } = await api.get('/session', { baseURL: '/' });

  return data;
}
