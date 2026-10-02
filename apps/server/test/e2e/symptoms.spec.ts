import type { FastifyInstance } from 'fastify';
import supertest from 'supertest';

import { create_app } from '~/app';
import { connection } from '~/libs/connection';

describe('GET /api/symptoms (e2e)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await create_app();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    await connection.destroy();
  });

  it('lista os sintomas com as perguntas que cada um ativa', async () => {
    const response = await supertest(app.server).get('/api/symptoms');

    expect(response.status).toBe(200);
    expect(response.body.base_questions).toEqual(['onset', 'age', 'pregnant']);
    expect(response.body.symptoms).toContainEqual({
      id: 'pain',
      label: 'Dor',
      questions: ['intensity'],
    });
    expect(response.body.symptoms).toContainEqual({ id: 'fever', label: 'Febre', questions: [] });
    expect(response.body.symptoms).toContainEqual({
      id: 'itching',
      label: 'Coceira',
      questions: [],
    });
    expect(response.body.symptoms).toContainEqual({
      id: 'tingling',
      label: 'Formigamento',
      questions: [],
    });
  });
});
