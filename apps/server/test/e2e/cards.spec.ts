import type { FastifyInstance } from 'fastify';
import supertest from 'supertest';

import { create_app } from '~/app';
import { connection } from '~/libs/connection';

import { clear_database, create_unit, create_user, login } from '../helpers';

const PHONE = '81990000301';

const SUMMARY = {
  level: 3,
  symptoms: ['Febre', 'Dor'],
  description: 'Dor de cabeça forte desde ontem.',
  onset: '1-2-days',
  intensity: 7,
  age: 34,
  pregnant: 'no',
  warning_signs: ['Manchas roxas na pele'],
  destination: { id: null, name: 'UPA Boa Vista' },
};

describe('/api/cards (e2e)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await create_app();
    await app.ready();
    await clear_database();

    const unit_id = await create_unit({ name: 'UPA Cartão', type: 'upa', network: 'public' });
    await create_user(unit_id, PHONE);
  });

  afterAll(async () => {
    await clear_database();
    await app.close();
    await connection.destroy();
  });

  it('gera o cartão e a recepção lê o resumo pelo token', async () => {
    const created = await supertest(app.server).post('/api/cards').send(SUMMARY);

    expect(created.status).toBe(201);
    expect(created.body.code).toMatch(/^#[0-9A-F]{4}$/);

    const expires_in_hours =
      (Date.parse(created.body.expires_at) - Date.parse(created.body.issued_at)) / 3_600_000;
    expect(expires_in_hours).toBe(12);

    const cookie = await login(app, PHONE);
    const read = await supertest(app.server)
      .get(`/api/cards/${created.body.token}`)
      .set('Cookie', cookie);

    expect(read.status).toBe(200);
    expect(read.body.code).toBe(created.body.code);
    expect(read.body.card).toEqual(SUMMARY);
  });

  it('exige login para ler o cartão', async () => {
    const created = await supertest(app.server).post('/api/cards').send(SUMMARY);

    const response = await supertest(app.server).get(`/api/cards/${created.body.token}`);

    expect(response.status).toBe(401);
  });

  it('recusa token adulterado', async () => {
    const cookie = await login(app, PHONE);

    const response = await supertest(app.server)
      .get('/api/cards/token-que-nao-e-jwt')
      .set('Cookie', cookie);

    expect(response.status).toBe(401);
  });
});
