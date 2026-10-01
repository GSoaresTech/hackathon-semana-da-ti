import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { SESSION_COOKIE, verifySession } from '~/libs/session';

/**
 * Sessão atual do usuário.
 *
 * Existe porque o backend não expõe um `GET /sessions`, e o cookie é httpOnly —
 * o JavaScript do browser não consegue lê-lo. Este handler roda no servidor,
 * verifica o JWT e devolve só o que a interface precisa.
 *
 * Fica em `/session` e não em `/api/session` de propósito: `/api/*` é reescrito
 * para o backend no `next.config.ts`, e um handler ali dependeria da ordem de
 * precedência entre rewrite e filesystem para funcionar.
 */
export async function GET() {
  const cookieStore = await cookies();
  const session = await verifySession(cookieStore.get(SESSION_COOKIE)?.value);

  if (!session) {
    return NextResponse.json({ error: 'Sessão expirada' }, { status: 401 });
  }

  return NextResponse.json({ session });
}
