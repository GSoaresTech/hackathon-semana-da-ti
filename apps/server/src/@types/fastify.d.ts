import 'fastify';

import type { SessionPayload } from '~/libs/tokens';

declare module 'fastify' {
  interface FastifyRequest {
    /** Preenchido pelo `protected_route_middleware` nas rotas autenticadas. */
    user?: SessionPayload;
  }
}
