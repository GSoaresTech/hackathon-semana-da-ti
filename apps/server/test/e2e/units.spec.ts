import type { FastifyInstance } from 'fastify';
import supertest from 'supertest';

import { create_app } from '~/app';
import { connection } from '~/libs/connection';

import { clear_database, create_unit, create_user, login } from '../helpers';

// Ponto de referência: centro de Caruaru.
const ORIGIN = { lat: -8.2838, lng: -35.9761 };

describe('/api/units (e2e)', () => {
  let app: FastifyInstance;
  let nearest_upa_id: string;
  let calm_upa_id: string;

  beforeAll(async () => {
    app = await create_app();
    await app.ready();
    await clear_database();

    nearest_upa_id = await create_unit({
      name: 'UPA Perto',
      type: 'upa',
      network: 'public',
      occupancy: 'high',
      lat: -8.2845,
      lng: -35.9765,
    });
    calm_upa_id = await create_unit({
      name: 'UPA Longe',
      type: 'upa',
      network: 'public',
      occupancy: 'low',
      lat: -8.3,
      lng: -35.99,
    });
    await create_unit({ name: 'UBS Centro', type: 'ubs', network: 'public' });
    await create_unit({ name: 'PS Plano', type: 'emergency_room', network: 'private' });
    await create_unit({
      name: 'Teleconsulta',
      type: 'telemedicine',
      network: 'private',
      lat: null,
      lng: null,
    });

    await create_user(nearest_upa_id, '81990000101');
  });

  afterAll(async () => {
    await clear_database();
    await app.close();
    await connection.destroy();
  });

  it('lista as UPAs do SUS para o nível 3, a mais tranquila primeiro, com aviso', async () => {
    const response = await supertest(app.server)
      .get('/api/units')
      .query({ level: 3, network: 'public', ...ORIGIN });

    expect(response.status).toBe(200);
    expect(response.body.units.map((unit: { name: string }) => unit.name)).toEqual([
      'UPA Longe',
      'UPA Perto',
    ]);
    expect(response.body.units[0].distance_km).toBeGreaterThan(0);
    expect(response.body.units[0].travel_minutes).toBeGreaterThan(0);
    expect(response.body.notice).toBe(
      'A UPA Perto lotou. Mostramos primeiro uma opção mais tranquila.',
    );
  });

  it('no plano, nível 3 inclui pronto-socorro e teleconsulta', async () => {
    const response = await supertest(app.server)
      .get('/api/units')
      .query({ level: 3, network: 'private', ...ORIGIN });

    expect(response.status).toBe(200);

    const names = response.body.units.map((unit: { name: string }) => unit.name);
    expect(names).toEqual(expect.arrayContaining(['PS Plano', 'Teleconsulta']));
    expect(names).not.toContain('UPA Longe');
  });

  it('rejeita parâmetros inválidos', async () => {
    const response = await supertest(app.server)
      .get('/api/units')
      .query({ level: 9, network: 'public' });

    expect(response.status).toBe(400);
  });

  describe('PATCH /api/units/:id/occupancy', () => {
    it('exige login', async () => {
      const response = await supertest(app.server)
        .patch(`/api/units/${nearest_upa_id}/occupancy`)
        .send({ occupancy: 'low' });

      expect(response.status).toBe(401);
    });

    it('atualiza a lotação da própria unidade', async () => {
      const cookie = await login(app, '81990000101');

      const response = await supertest(app.server)
        .patch(`/api/units/${nearest_upa_id}/occupancy`)
        .set('Cookie', cookie)
        .send({ occupancy: 'medium' });

      expect(response.status).toBe(200);
      expect(response.body.unit.occupancy).toBe('medium');
    });

    it('não deixa alterar outra unidade', async () => {
      const cookie = await login(app, '81990000101');

      const response = await supertest(app.server)
        .patch(`/api/units/${calm_upa_id}/occupancy`)
        .set('Cookie', cookie)
        .send({ occupancy: 'high' });

      expect(response.status).toBe(403);
    });
  });
});
