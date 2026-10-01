import type { FastifyInstance } from 'fastify';

import { health_routes } from '~/routes/health-routes';

async function app_routes(app: FastifyInstance) {
  app.register(health_routes);
}

export { app_routes };
