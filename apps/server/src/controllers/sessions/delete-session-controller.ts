import type { FastifyReply, FastifyRequest, RouteShorthandOptions } from 'fastify';

import { session_cookie_options } from '~/controllers/sessions/sessions-cookie';
import { SESSION_COOKIE } from '~/middlewares/protected-route-middleware';

// Não exige sessão válida: sair com cookie expirado também precisa limpar o cookie.
async function delete_session_controller(_request: FastifyRequest, reply: FastifyReply) {
  reply.clearCookie(SESSION_COOKIE, session_cookie_options);

  return reply.status(204).send();
}

export { delete_session_controller };

delete_session_controller.options = {
  schema: {
    tags: ['sessions'],
    summary: 'Logout (limpa o cookie de sessão)',
  },
} as RouteShorthandOptions;
