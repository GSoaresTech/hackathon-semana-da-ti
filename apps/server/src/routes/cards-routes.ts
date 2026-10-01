import type { FastifyInstance } from 'fastify';

import { create_card_controller } from '~/controllers/cards/create-card-controller';
import { get_card_controller } from '~/controllers/cards/get-card-controller';

async function cards_routes(app: FastifyInstance) {
  app.post('/cards', create_card_controller.options, create_card_controller);
  app.get('/cards/:token', get_card_controller.options, get_card_controller);
}

export { cards_routes };
