import type { FastifyInstance } from 'fastify';
import supertest from 'supertest';

import { create_app } from '~/app';
import { connection } from '~/libs/connection';

describe('GET /api/health (e2e)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await create_app();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    await connection.destroy();
  });

  it('retorna status ok e o banco conectado', async () => {
    const response = await supertest(app.server).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.database_status).toBe('connected');
    expect(typeof response.body.uptime).toBe('number');
    expect(typeof response.body.timestamp).toBe('string');
  });
});
