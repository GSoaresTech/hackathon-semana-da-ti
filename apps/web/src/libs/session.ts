import 'server-only';

import { jwtVerify } from 'jose';

import type { Roles } from '~/libs/constants';
import { serverEnv } from '~/libs/env.server';

/**
 * Leitura e verificação do cookie de sessão, no servidor.
 *
 * O backend assina o JWT com HS256 usando o próprio `SECRET`. Aqui usamos o
 * mesmo segredo (`SESSION_SECRET`) só para VERIFICAR — nunca para emitir token.
 *
 * Verificar de verdade importa: conferir apenas a presença do cookie aceitaria
 * um valor forjado por qualquer um e deixaria o `proxy.ts` liberar a rota.
 */

/** Nome dos cookies emitidos pelo backend. */
const AUTHORIZATION_COOKIE = 'authorization'; // pós-credenciais, antes do perfil
const SESSION_COOKIE = 'token'; // sessão completa (usuário + perfil)

interface Session {
  userId: string;
  profileId: string;
  companyId: string | null;
  role: Roles;
  situation: number;
  installationId: string | null;
}

const secret = new TextEncoder().encode(serverEnv.SESSION_SECRET);

/**
 * Verifica assinatura e expiração. Devolve `null` em qualquer falha — quem
 * chama trata sessão inválida e sessão ausente do mesmo jeito.
 *
 * O payload do JWT vem em snake_case (não passa pelo interceptor do axios),
 * então normalizamos para camelCase aqui, na fronteira.
 */
async function verifySession(token?: string): Promise<Session | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] });

    if (typeof payload.id !== 'string' || typeof payload.profile_id !== 'string') {
      return null;
    }

    return {
      userId: payload.id,
      profileId: payload.profile_id,
      companyId: (payload.company_id as string | null) ?? null,
      role: payload.role as Roles,
      situation: (payload.situation as number) ?? 0,
      installationId: (payload.installation_id as string | null) ?? null,
    };
  } catch {
    // Assinatura inválida, token expirado ou malformado.
    return null;
  }
}

/** Verifica o cookie intermediário de credenciais e devolve o id do usuário. */
async function verifyAuthorization(token?: string): Promise<{ userId: string } | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] });

    return typeof payload.id === 'string' ? { userId: payload.id } : null;
  } catch {
    return null;
  }
}

export type { Session };
export { AUTHORIZATION_COOKIE, SESSION_COOKIE, verifyAuthorization, verifySession };
