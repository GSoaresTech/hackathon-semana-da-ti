import type { FastifyReply, FastifyRequest, RouteShorthandOptions } from 'fastify';
import { z } from 'zod';

import { health_case } from '~/cases/health/get-health-case';

const health_response_schema = z.object({
  status: z.string(),
  uptime: z.number(),
  timestamp: z.string(),
  database_status: z.string(),
});

async function health_controller(_request: FastifyRequest, reply: FastifyReply) {
  const data = await health_case();

  return reply.send(data);
}

export { health_controller };

health_controller.options = {
  schema: {
    tags: ['health'],
    summary: 'Health check da API',
    response: {
      200: health_response_schema,
    },
  },
} as RouteShorthandOptions;
