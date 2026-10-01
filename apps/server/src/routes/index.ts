import type { FastifyInstance } from 'fastify';

import { cards_routes } from '~/routes/cards-routes';
import { health_routes } from '~/routes/health-routes';
import { sessions_routes } from '~/routes/sessions-routes';
import { symptoms_routes } from '~/routes/symptoms-routes';
import { triage_routes } from '~/routes/triage-routes';
import { units_routes } from '~/routes/units-routes';

async function app_routes(app: FastifyInstance) {
  app.register(health_routes);
  app.register(symptoms_routes);
  app.register(triage_routes);
  app.register(units_routes);
  app.register(cards_routes);
  app.register(sessions_routes);
}

export { app_routes };
