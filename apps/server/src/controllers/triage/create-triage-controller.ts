import type { FastifyReply, FastifyRequest, RouteShorthandOptions } from 'fastify';
import { z } from 'zod';

import { SYMPTOM_IDS } from '~/cases/symptoms/symptoms-catalog';
import { create_triage_case } from '~/cases/triage/create-triage-case';

const create_triage_body_schema = z.object({
  network: z.enum(['public', 'private']),
  symptoms: z.array(z.enum(SYMPTOM_IDS)).max(SYMPTOM_IDS.length),
  description: z.string().trim().max(500).nullish(),
  answers: z
    .object({
      onset: z.enum(['hours', '1-2-days', '3-7-days', 'over-1-week']),
      intensity: z.number().int().min(0).max(10).nullish(),
      age: z.number().int().min(0).max(120),
      pregnant: z.enum(['yes', 'no', 'not-applicable']),
    })
    .nullish(),
});

const create_triage_response_schema = z.union([
  z.object({
    emergency: z.literal(true),
    reason: z.string(),
    instructions: z.array(z.string()),
  }),
  z.object({
    emergency: z.literal(false),
    level: z.number(),
    title: z.string(),
    explanation: z.string(),
    instructions: z.array(z.string()),
    warning_signs: z.array(z.string()),
    result_token: z.string(),
  }),
  z.object({
    emergency: z.literal(false),
  }),
]);

async function create_triage_controller(request: FastifyRequest, reply: FastifyReply) {
  const body = create_triage_body_schema.parse(request.body);

  if (body.symptoms.length === 0 && !body.description) {
    return reply.status(400).send({ error: 'Marque um sintoma ou descreva o que você sente' });
  }

  const data = await create_triage_case(body);

  return reply.send(data);
}

export { create_triage_controller };

create_triage_controller.options = {
  schema: {
    tags: ['triage'],
    summary: 'Classifica a urgência (regras de sinal grave antes da IA)',
    description:
      'Sem `answers`, roda só as regras de sinal grave (etapa Sintomas). Com `answers`, ' +
      'se não houver sinal grave, a IA classifica o nível de 2 a 5. Falha da IA responde 503.',
    body: create_triage_body_schema,
    response: {
      200: create_triage_response_schema,
    },
  },
} as RouteShorthandOptions;
