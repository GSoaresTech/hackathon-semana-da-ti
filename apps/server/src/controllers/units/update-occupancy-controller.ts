import type { FastifyReply, FastifyRequest, RouteShorthandOptions } from 'fastify';
import { z } from 'zod';

import { update_occupancy_case } from '~/cases/units/update-occupancy-case';
import { unit_schema } from '~/controllers/units/units-schemas';
import {
  get_authenticated_user,
  protected_route_middleware,
} from '~/middlewares/protected-route-middleware';

const update_occupancy_params_schema = z.object({
  id: z.uuid(),
});

const update_occupancy_body_schema = z.object({
  occupancy: z.enum(['low', 'medium', 'high']),
});

async function update_occupancy_controller(request: FastifyRequest, reply: FastifyReply) {
  const { id } = update_occupancy_params_schema.parse(request.params);
  const { occupancy } = update_occupancy_body_schema.parse(request.body);
  const user = get_authenticated_user(request);

  const data = await update_occupancy_case({ unit_id: id, occupancy, user_unit_id: user.unit_id });

  return reply.send(data);
}

export { update_occupancy_controller };

update_occupancy_controller.options = {
  preHandler: [protected_route_middleware],
  schema: {
    tags: ['units'],
    summary: 'Atualiza a lotação da unidade do usuário logado (demo)',
    params: update_occupancy_params_schema,
    body: update_occupancy_body_schema,
    response: {
      200: z.object({ unit: unit_schema }),
    },
  },
} as RouteShorthandOptions;
