import type { FastifyInstance } from 'fastify';

import { create_session_controller } from '~/controllers/sessions/create-session-controller';
import { delete_session_controller } from '~/controllers/sessions/delete-session-controller';
import { get_me_controller } from '~/controllers/sessions/get-me-controller';

async function sessions_routes(app: FastifyInstance) {
  app.post('/sessions', create_session_controller.options, create_session_controller);
  app.delete('/sessions', delete_session_controller.options, delete_session_controller);
  app.get('/sessions/me', get_me_controller.options, get_me_controller);
}

export { sessions_routes };
