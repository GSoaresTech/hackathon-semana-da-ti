import type { FastifyInstance } from 'fastify';
import supertest from 'supertest';

import { create_app } from '~/app';
import { connection } from '~/libs/connection';

import { clear_database, create_unit, create_user, login, TEST_PASSWORD } from '../helpers';

const PHONE = '81990000201';

describe('/api/sessions (e2e)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await create_app();
    await app.ready();
    await clear_database();

    const unit_id = await create_unit({ name: 'UPA Login', type: 'upa', network: 'public' });
    await create_user(unit_id, PHONE);
  });

  afterAll(async () => {
    await clear_database();
    await app.close();
    await connection.destroy();
  });

  it('faz login por telefone (com máscara) e devolve o cookie httpOnly', async () => {
    const response = await supertest(app.server)
      .post('/api/sessions')
      .send({ phone: '(81) 99000-0201', password: TEST_PASSWORD });

    expect(response.status).toBe(201);
    expect(response.body.unit.name).toBe('UPA Login');
    expect(response.get('Set-Cookie')?.[0]).toMatch(/^token=.+HttpOnly/);
  });

  it('recusa senha errada', async () => {
    const response = await supertest(app.server)
      .post('/api/sessions')
      .send({ phone: PHONE, password: 'errada' });

    expect(response.status).toBe(401);
    expect(response.get('Set-Cookie')).toBeUndefined();
  });

  it('devolve o usuário logado e a unidade dele', async () => {
    const cookie = await login(app, PHONE);

    const response = await supertest(app.server).get('/api/sessions/me').set('Cookie', cookie);

    expect(response.status).toBe(200);
    expect(response.body.user.phone).toBe(PHONE);
    expect(response.body.unit.name).toBe('UPA Login');
  });

  it('exige login em /me', async () => {
    const response = await supertest(app.server).get('/api/sessions/me');

    expect(response.status).toBe(401);
  });

  it('logout limpa o cookie', async () => {
    const response = await supertest(app.server).delete('/api/sessions');

    expect(response.status).toBe(204);
    expect(response.get('Set-Cookie')?.[0]).toMatch(/^token=;/);
  });
});
