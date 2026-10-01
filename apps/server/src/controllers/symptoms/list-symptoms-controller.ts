import type { FastifyReply, FastifyRequest, RouteShorthandOptions } from 'fastify';
import { z } from 'zod';

import { list_symptoms_case } from '~/cases/symptoms/list-symptoms-case';

const question_schema = z.enum(['onset', 'intensity', 'age', 'pregnant']);

const list_symptoms_response_schema = z.object({
  symptoms: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      questions: z.array(question_schema),
    }),
  ),
  base_questions: z.array(question_schema),
});

async function list_symptoms_controller(_request: FastifyRequest, reply: FastifyReply) {
  const data = await list_symptoms_case();

  return reply.send(data);
}

export { list_symptoms_controller };

list_symptoms_controller.options = {
  schema: {
    tags: ['symptoms'],
    summary: 'Lista os sintomas pré-definidos e as perguntas que cada um ativa',
    response: {
      200: list_symptoms_response_schema,
    },
  },
} as RouteShorthandOptions;
