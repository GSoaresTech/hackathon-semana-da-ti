import { type NextRequest, NextResponse } from 'next/server';

import { SESSION_COOKIE, verifySession } from '~/libs/session';

/**
 * Proxy — no Next 16 é isto que antes se chamava `middleware.ts`.
 *
 * O fluxo do paciente é anônimo. Só a área da recepção (`/unit`) exige sessão;
 * sem ela, manda para `/signin?redirect=`. Quem já está logado e abre
 * `/signin` vai direto para `/unit`.
 *
 * Isto é a primeira linha de defesa, não a única. A autorização que vale é a do
 * backend — o proxy só evita renderizar tela que a pessoa não pode ver.
 */
const PROTECTED_PATHS = [/^\/unit(\/.*)?$/];

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname.startsWith('/signin') && session) {
    return NextResponse.redirect(new URL('/unit', request.url));
  }

  const isProtected = PROTECTED_PATHS.some((regex) => regex.test(pathname));

  if (isProtected && !session) {
    const signInUrl = new URL('/signin', request.url);
    signInUrl.searchParams.set('redirect', pathname + search);

    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  /**
   * Roda só onde a sessão importa — o resto do app (fluxo do paciente) não
   * paga o custo de verificar JWT a cada navegação.
   */
  matcher: ['/unit/:path*', '/signin'],
};
