import type { FastifyReply, FastifyRequest } from 'fastify';
import { ZodError, z } from 'zod';

import { env } from '~/libs/environments';
import { AppError } from '~/libs/errors/app-errors';

async function error_handler_middleware(
  error: unknown,
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  if (error instanceof ZodError) {
    return reply.status(400).send({ error: 'Dados inválidos', issues: z.treeifyError(error) });
  }

  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({ error: error.message });
  }

  if (
    error instanceof Error &&
    'statusCode' in error &&
    typeof (error as { statusCode?: unknown }).statusCode === 'number' &&
    (error as { statusCode: number }).statusCode < 500
  ) {
    return reply
      .status((error as { statusCode: number }).statusCode)
      .send({ error: error.message });
  }

  if (env.NODE_ENV !== 'production') {
    console.error(error);
  }

  return reply.status(500).send({ error: 'Erro interno do servidor' });
}

export { error_handler_middleware };
