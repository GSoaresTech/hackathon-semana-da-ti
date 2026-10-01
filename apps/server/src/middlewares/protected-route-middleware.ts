import type { FastifyReply, FastifyRequest } from 'fastify';

import { UnauthorizedError } from '~/libs/errors/app-errors';
import { verify_session } from '~/libs/tokens';

/** Nome do cookie httpOnly de sessão — o mesmo que o web lê no proxy.ts. */
const SESSION_COOKIE = 'token';

/**
 * Exige sessão válida e anexa `request.user`. Use como `preHandler` no
 * `.options` do controller.
 */
async function protected_route_middleware(request: FastifyRequest, _reply: FastifyReply) {
  const session = await verify_session(request.cookies[SESSION_COOKIE]);

  if (!session) throw new UnauthorizedError();

  request.user = session;
}

/** Lê o usuário anexado pelo middleware — falha alto se a rota esqueceu dele. */
function get_authenticated_user(request: FastifyRequest) {
  if (!request.user) throw new UnauthorizedError();

  return request.user;
}

export { get_authenticated_user, protected_route_middleware, SESSION_COOKIE };
