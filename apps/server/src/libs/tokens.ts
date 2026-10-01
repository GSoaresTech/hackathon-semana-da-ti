import { errors, type JWTPayload, jwtVerify, SignJWT } from 'jose';

import { env } from '~/libs/environments';

/*
 * JWTs HS256 assinados pelo backend.
 *
 * - Sessão (cookie `token`): assinada com SESSION_SECRET. O web usa o MESMO
 *   segredo só para verificar, no proxy.ts.
 * - Cartão de triagem (QR code): assinado com CARD_SECRET. O resumo do caso vai
 *   dentro do token — nada de saúde é salvo em banco (LGPD).
 */

const SESSION_TTL = '12h';
const CARD_TTL_HOURS = 12;

const session_secret = new TextEncoder().encode(env.SESSION_SECRET);
const card_secret = new TextEncoder().encode(env.CARD_SECRET);

type SessionPayload = {
  id: string;
  unit_id: string;
  name: string;
};

async function sign_session(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(SESSION_TTL)
    .sign(session_secret);
}

/** Devolve `null` para token ausente, expirado, malformado ou com assinatura inválida. */
async function verify_session(token?: string): Promise<SessionPayload | null> {
  const payload = await verify(token, session_secret);
  if (!payload) return null;

  if (
    typeof payload.id !== 'string' ||
    typeof payload.unit_id !== 'string' ||
    typeof payload.name !== 'string'
  ) {
    return null;
  }

  return { id: payload.id, unit_id: payload.unit_id, name: payload.name };
}

type SignedCard<T> = {
  token: string;
  issued_at: Date;
  expires_at: Date;
  payload: T;
};

async function sign_card<T extends Record<string, unknown>>(payload: T): Promise<SignedCard<T>> {
  const issued_at = new Date();
  const expires_at = new Date(issued_at.getTime() + CARD_TTL_HOURS * 60 * 60 * 1000);

  const token = await new SignJWT({ card: payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(issued_at)
    .setExpirationTime(expires_at)
    .sign(card_secret);

  return { token, issued_at, expires_at, payload };
}

type VerifiedCard = {
  card: unknown;
  issued_at: Date;
  expires_at: Date;
};

async function verify_card(token?: string): Promise<VerifiedCard | null> {
  const payload = await verify(token, card_secret);
  if (!payload?.iat || !payload.exp) return null;

  return {
    card: payload.card,
    issued_at: new Date(payload.iat * 1000),
    expires_at: new Date(payload.exp * 1000),
  };
}

async function verify(token: string | undefined, secret: Uint8Array): Promise<JWTPayload | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] });

    return payload;
  } catch (error) {
    if (error instanceof errors.JOSEError) return null;

    throw error;
  }
}

export type { SessionPayload, SignedCard, VerifiedCard };
export { sign_card, sign_session, verify_card, verify_session };
