import type { FastifyInstance } from 'fastify';
import supertest from 'supertest';

import { create_app } from '~/app';
import { connection } from '~/libs/connection';
import { build_demo_cards } from '~/scripts/demo-cards';

import { clear_database, create_unit, create_user, login } from '../helpers';

const PHONE = '81990000401';

describe('cartões de demonstração', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await create_app();
    await app.ready();
    await clear_database();

    const unit_id = await create_unit({
      name: 'Pronto-socorro Santa Clara',
      type: 'emergency_room',
      network: 'private',
    });
    await create_user(unit_id, PHONE);
  });

  afterAll(async () => {
    await clear_database();
    await app.close();
    await connection.destroy();
  });

  it('gera cinco cartões válidos, com códigos distintos e lidos pela API', async () => {
    const cards = await build_demo_cards();

    expect(cards).toHaveLength(5);
    expect(new Set(cards.map((card) => card.code)).size).toBe(5);
    for (const card of cards) {
      expect(card.code).toMatch(/^#[0-9A-F]{4}$/);
      expect(card.path).toBe(`/unit/cards/${card.token}`);
    }

    const cookie = await login(app, PHONE);
    const read_levels: number[] = [];
    const read_travels: Array<number | null> = [];

    for (const demo of cards) {
      const response = await supertest(app.server)
        .get(`/api/cards/${demo.token}`)
        .set('Cookie', cookie);

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(demo.code);
      expect(response.body.card.level).toBe(demo.level);

      read_levels.push(response.body.card.level);
      read_travels.push(response.body.card.destination?.travel_minutes ?? null);
    }

    expect(read_levels).toEqual([2, 3, 3, 4, 5]);
    expect(read_travels).toEqual([5, 12, 0, 20, 35]);
  });
});
