import 'server-only';

import { jwtVerify } from 'jose';

import { serverEnv } from '~/libs/env.server';

/**
 * Leitura e verificação do cookie de sessão da recepção, no servidor.
 *
 * O backend assina o JWT com HS256 usando o próprio `SESSION_SECRET`. Aqui
 * usamos o mesmo segredo só para VERIFICAR — nunca para emitir token.
 *
 * Verificar de verdade importa: conferir apenas a presença do cookie aceitaria
 * um valor forjado por qualquer um e deixaria o `proxy.ts` liberar a rota.
 */

/** Nome do cookie emitido pelo backend em POST /sessions. */
const SESSION_COOKIE = 'token';

interface Session {
  userId: string;
  unitId: string;
  name: string;
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

    if (
      typeof payload.id !== 'string' ||
      typeof payload.unit_id !== 'string' ||
      typeof payload.name !== 'string'
    ) {
      return null;
    }

    return { userId: payload.id, unitId: payload.unit_id, name: payload.name };
  } catch {
    // Assinatura inválida, token expirado ou malformado.
    return null;
  }
}

export type { Session };
export { SESSION_COOKIE, verifySession };
