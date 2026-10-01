import type { FastifyInstance } from 'fastify';

import { create_triage_controller } from '~/controllers/triage/create-triage-controller';

async function triage_routes(app: FastifyInstance) {
  app.post('/triage', create_triage_controller.options, create_triage_controller);
}

export { triage_routes };
