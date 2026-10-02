import { errors, type JWTPayload, jwtVerify, SignJWT } from 'jose';

import type { TriageResultClaims } from '~/cases/triage/triage-types';
import { env } from '~/libs/environments';

/*
 * JWTs HS256 assinados pelo backend.
 *
 * - Sessão (cookie `token`): assinada com SESSION_SECRET. O web usa o MESMO
 *   segredo só para verificar, no proxy.ts.
 * - Resultado da triagem: assinada com CARD_SECRET, audience `triage-result`.
 *   É a prova de que o nível foi definido pela IA do server, não pelo cliente.
 * - Cartão de triagem (QR code): assinado com CARD_SECRET, audience `card`.
 *   O resumo do caso vai dentro do token — nada de saúde é salvo em banco (LGPD).
 *
 * As audiences impedem que um tipo de token valha como o outro.
 */

const SESSION_TTL = '12h';
const CARD_TTL_HOURS = 12;

const CARD_AUDIENCE = 'card';
const TRIAGE_RESULT_AUDIENCE = 'triage-result';

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
    .setAudience(CARD_AUDIENCE)
    .sign(card_secret);

  return { token, issued_at, expires_at, payload };
}

type VerifiedCard = {
  card: unknown;
  issued_at: Date;
  expires_at: Date;
};

async function verify_card(token?: string): Promise<VerifiedCard | null> {
  const payload = await verify(token, card_secret, CARD_AUDIENCE);
  if (!payload?.iat || !payload.exp) return null;

  return {
    card: payload.card,
    issued_at: new Date(payload.iat * 1000),
    expires_at: new Date(payload.exp * 1000),
  };
}

async function sign_triage_result(claims: TriageResultClaims): Promise<string> {
  const issued_at = new Date();
  const expires_at = new Date(issued_at.getTime() + CARD_TTL_HOURS * 60 * 60 * 1000);

  return new SignJWT({ result: claims })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(issued_at)
    .setExpirationTime(expires_at)
    .setAudience(TRIAGE_RESULT_AUDIENCE)
    .sign(card_secret);
}

async function verify_triage_result(token?: string): Promise<TriageResultClaims | null> {
  const payload = await verify(token, card_secret, TRIAGE_RESULT_AUDIENCE);
  if (!payload) return null;

  const result = payload.result;
  if (!is_triage_result_claims(result)) return null;

  return result;
}

function is_triage_result_claims(value: unknown): value is TriageResultClaims {
  if (!value || typeof value !== 'object') return false;

  const claims = value as Record<string, unknown>;

  return (
    typeof claims.level === 'number' &&
    Array.isArray(claims.warning_signs) &&
    Array.isArray(claims.symptoms) &&
    (claims.description === null || typeof claims.description === 'string') &&
    (claims.onset === null || typeof claims.onset === 'string') &&
    (claims.intensity === null || typeof claims.intensity === 'number') &&
    (claims.age === null || typeof claims.age === 'number') &&
    (claims.pregnant === null || typeof claims.pregnant === 'string')
  );
}

async function verify(
  token: string | undefined,
  secret: Uint8Array,
  audience?: string,
): Promise<JWTPayload | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
      ...(audience ? { audience } : {}),
    });

    return payload;
  } catch (error) {
    if (error instanceof errors.JOSEError) return null;

    throw error;
  }
}

export type { SessionPayload, SignedCard, VerifiedCard };
export {
  sign_card,
  sign_session,
  sign_triage_result,
  verify_card,
  verify_session,
  verify_triage_result,
};
