import { type NextRequest, NextResponse } from 'next/server';

import { canAccess } from '~/libs/access';
import { getDefaultRouteByRole } from '~/libs/constants';
import { paths } from '~/libs/pages';
import { SESSION_COOKIE, verifySession } from '~/libs/session';

/**
 * Proxy — no Next 16 é isto que antes se chamava `middleware.ts`.
 *
 * Diferenças que importam em relação ao middleware do Next 15:
 * - o arquivo se chama `proxy.ts` e a função exportada se chama `proxy`;
 * - o runtime é sempre `nodejs` e não é configurável (edge não é suportado),
 *   o que aqui é vantagem: dá para verificar o JWT com `jose` sem restrição.
 *
 * Isto é a primeira linha de defesa, não a única. A autorização que vale é a do
 * backend — o proxy só evita renderizar tela que o usuário não pode ver.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);

  // Raiz: manda para o lugar certo conforme o papel de quem está logado.
  if (pathname === '/') {
    const target = session ? getDefaultRouteByRole(session.role) : '/signin';

    return NextResponse.redirect(new URL(target, request.url));
  }

  // Já logado não precisa ver a tela de login.
  if (pathname.startsWith('/signin') && session) {
    return NextResponse.redirect(new URL(getDefaultRouteByRole(session.role), request.url));
  }

  const path = paths.find(({ regex }) => regex.test(pathname));

  // Rota não registrada em `~/libs/pages` é pública por definição.
  if (!path) return NextResponse.next();

  if (!session) {
    const signInUrl = new URL('/signin', request.url);

    // Preserva o destino para voltar até ele depois do login.
    if (pathname !== '/') signInUrl.searchParams.set('redirect', pathname + search);

    return NextResponse.redirect(signInUrl);
  }

  if (!canAccess({ roles: path.roles }, { role: session.role })) {
    return NextResponse.redirect(new URL(getDefaultRouteByRole(session.role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  /**
   * Sem `matcher` o proxy rodaria em toda requisição, inclusive assets e
   * prefetches — custo por request e latência de navegação à toa.
   *
   * Exclui: rotas de API, arquivos internos do Next, o handler `/session` e
   * qualquer caminho com extensão (favicon, imagens, fontes).
   */
  matcher: ['/((?!api|session|_next/static|_next/image|.*\\.[\\w]+$).*)'],
};
