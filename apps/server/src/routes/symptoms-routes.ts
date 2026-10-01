import type { FastifyInstance } from 'fastify';

import { list_symptoms_controller } from '~/controllers/symptoms/list-symptoms-controller';

async function symptoms_routes(app: FastifyInstance) {
  app.get('/symptoms', list_symptoms_controller.options, list_symptoms_controller);
}

export { symptoms_routes };
