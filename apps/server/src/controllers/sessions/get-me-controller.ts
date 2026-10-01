import type { FastifyReply, FastifyRequest, RouteShorthandOptions } from 'fastify';
import { z } from 'zod';

import { get_me_case } from '~/cases/sessions/get-me-case';
import { unit_schema } from '~/controllers/units/units-schemas';
import {
  get_authenticated_user,
  protected_route_middleware,
} from '~/middlewares/protected-route-middleware';

const get_me_response_schema = z.object({
  user: z.object({ id: z.string(), name: z.string(), phone: z.string() }),
  unit: unit_schema,
});

async function get_me_controller(request: FastifyRequest, reply: FastifyReply) {
  const user = get_authenticated_user(request);

  const data = await get_me_case({ user_id: user.id });

  return reply.send(data);
}

export { get_me_controller };

get_me_controller.options = {
  preHandler: [protected_route_middleware],
  schema: {
    tags: ['sessions'],
    summary: 'Usuário logado e a unidade dele',
    response: {
      200: get_me_response_schema,
    },
  },
} as RouteShorthandOptions;
