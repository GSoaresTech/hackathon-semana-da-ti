import type { FastifyReply, FastifyRequest, RouteShorthandOptions } from 'fastify';
import { z } from 'zod';

import { get_card_case } from '~/cases/cards/get-card-case';
import { protected_route_middleware } from '~/middlewares/protected-route-middleware';

const get_card_params_schema = z.object({
  token: z.string().min(1).max(4096),
});

const get_card_response_schema = z.object({
  code: z.string(),
  issued_at: z.string(),
  expires_at: z.string(),
  card: z.object({
    level: z.number(),
    symptoms: z.array(z.string()),
    description: z.string().nullable(),
    onset: z.string().nullable(),
    intensity: z.number().nullable(),
    age: z.number().nullable(),
    pregnant: z.string().nullable(),
    warning_signs: z.array(z.string()),
    destination: z.object({ id: z.string().nullable(), name: z.string() }).nullable(),
  }),
});

async function get_card_controller(request: FastifyRequest, reply: FastifyReply) {
  const { token } = get_card_params_schema.parse(request.params);

  const data = await get_card_case({ token });

  return reply.send(data);
}

export { get_card_controller };

get_card_controller.options = {
  preHandler: [protected_route_middleware],
  schema: {
    tags: ['cards'],
    summary: 'Lê um cartão de triagem pelo token do QR code (recepção da unidade)',
    params: get_card_params_schema,
    response: {
      200: get_card_response_schema,
    },
  },
} as RouteShorthandOptions;
