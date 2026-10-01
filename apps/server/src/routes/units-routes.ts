import type { FastifyInstance } from 'fastify';

import { list_units_controller } from '~/controllers/units/list-units-controller';
import { update_occupancy_controller } from '~/controllers/units/update-occupancy-controller';

async function units_routes(app: FastifyInstance) {
  app.get('/units', list_units_controller.options, list_units_controller);
  app.patch(
    '/units/:id/occupancy',
    update_occupancy_controller.options,
    update_occupancy_controller,
  );
}

export { units_routes };
