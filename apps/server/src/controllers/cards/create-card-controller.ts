import type { FastifyReply, FastifyRequest, RouteShorthandOptions } from 'fastify';
import { z } from 'zod';

import { create_card_case } from '~/cases/cards/create-card-case';

const create_card_body_schema = z.object({
  level: z.number().int().min(1).max(5),
  symptoms: z.array(z.string().trim().min(1).max(40)).max(20),
  description: z.string().trim().max(500).nullable().default(null),
  onset: z.enum(['hours', '1-2-days', '3-7-days', 'over-1-week']).nullable().default(null),
  intensity: z.number().int().min(0).max(10).nullable().default(null),
  age: z.number().int().min(0).max(120).nullable().default(null),
  pregnant: z.enum(['yes', 'no', 'not-applicable']).nullable().default(null),
  warning_signs: z.array(z.string().trim().min(1).max(80)).max(6).default([]),
  destination: z
    .object({
      id: z.string().nullable().default(null),
      name: z.string().trim().min(1).max(120),
    })
    .nullable()
    .default(null),
});

const create_card_response_schema = z.object({
  token: z.string(),
  code: z.string(),
  issued_at: z.string(),
  expires_at: z.string(),
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
    summary: 'Gera o cartão de triagem (token assinado com o resumo, válido por 12 h)',
    body: create_card_body_schema,
    response: {
      201: create_card_response_schema,
    },
  },
} as RouteShorthandOptions;
