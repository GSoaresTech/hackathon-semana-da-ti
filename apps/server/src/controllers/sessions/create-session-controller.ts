import type { FastifyReply, FastifyRequest, RouteShorthandOptions } from 'fastify';
import { z } from 'zod';

import { create_session_case } from '~/cases/sessions/create-session-case';
import {
  SESSION_MAX_AGE_SECONDS,
  session_cookie_options,
} from '~/controllers/sessions/sessions-cookie';
import { SESSION_COOKIE } from '~/middlewares/protected-route-middleware';

const create_session_body_schema = z.object({
  // Aceita com ou sem máscara; guarda e compara só os dígitos (DDD + número).
  phone: z
    .string()
    .transform((value) => value.replace(/\D/g, ''))
    .pipe(z.string().regex(/^\d{10,11}$/, { error: 'Telefone inválido' })),
  password: z.string().min(1).max(72),
});

const create_session_response_schema = z.object({
  user: z.object({ id: z.string(), name: z.string(), phone: z.string() }),
  unit: z.object({ id: z.string(), name: z.string() }),
});

async function create_session_controller(request: FastifyRequest, reply: FastifyReply) {
  const body = create_session_body_schema.parse(request.body);

  const { token, user, unit } = await create_session_case(body);

  reply.setCookie(SESSION_COOKIE, token, {
    ...session_cookie_options,
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return reply.status(201).send({ user, unit });
}

export { create_session_controller };

create_session_controller.options = {
  schema: {
    tags: ['sessions'],
    summary: 'Login da recepção por telefone e senha (cookie httpOnly `token`)',
    body: create_session_body_schema,
    response: {
      201: create_session_response_schema,
    },
  },
} as RouteShorthandOptions;
