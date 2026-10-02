import type { FastifyReply, FastifyRequest, RouteShorthandOptions } from 'fastify';
import { z } from 'zod';

import { create_card_case } from '~/cases/cards/create-card-case';
import { card_response_schema, destination_schema } from '~/controllers/cards/cards-schemas';

const create_card_body_schema = z.object({
  result_token: z.string().min(1).max(4096),
  destination: destination_schema.nullable().default(null),
});

async function create_card_controller(request: FastifyRequest, reply: FastifyReply) {
  const body = create_card_body_schema.parse(request.body);

  const data = await create_card_case(body);

  return reply.status(201).send(data);
}

export { create_card_controller };

create_card_controller.options = {
  schema: {
    tags: ['cards'],
    summary:
      'Gera o cartão de triagem a partir do resultado assinado (JWT com o resumo, válido por 12 h)',
    body: create_card_body_schema,
    response: {
      201: card_response_schema,
    },
  },
} as RouteShorthandOptions;
