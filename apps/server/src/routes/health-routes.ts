import type { FastifyInstance } from 'fastify';

import { health_controller } from '~/controllers/health/get-health-controller';

async function health_routes(app: FastifyInstance) {
  app.get('/health', health_controller.options, health_controller);
}

export { health_routes };
