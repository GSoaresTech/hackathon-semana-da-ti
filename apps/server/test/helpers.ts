import type { FastifyInstance } from 'fastify';
import supertest from 'supertest';

import { connection } from '~/libs/connection';
import { hash_password } from '~/libs/hash';

/*
 * Fixtures compartilhadas pelas specs e2e. Cada spec limpa o que criou.
 */

type UnitFixture = {
  name: string;
  type: 'ubs' | 'upa' | 'emergency_room' | 'hospital' | 'clinic' | 'telemedicine';
  network: 'public' | 'private';
  occupancy?: 'low' | 'medium' | 'high';
  lat?: number | null;
  lng?: number | null;
};

async function create_unit(fixture: UnitFixture): Promise<string> {
  const [{ id }] = await connection('units')
    .insert({
      occupancy: 'low',
      opening_hours: '24 h',
      lat: -8.2838,
      lng: -35.9761,
      ...fixture,
    })
    .returning('id');

  return id;
}

const TEST_PASSWORD = 'senha-de-teste';

async function create_user(unit_id: string, phone: string): Promise<void> {
  await connection('users').insert({
    name: 'Recepção Teste',
    phone,
    password_hash: await hash_password(TEST_PASSWORD),
    unit_id,
  });
}

/** Faz login e devolve o header `Set-Cookie` para reutilizar nas próximas chamadas. */
async function login(app: FastifyInstance, phone: string): Promise<string[]> {
  const response = await supertest(app.server)
    .post('/api/sessions')
    .send({ phone, password: TEST_PASSWORD });

  return response.get('Set-Cookie') ?? [];
}

async function clear_database(): Promise<void> {
  await connection('users').del();
  await connection('units').del();
}

export { clear_database, create_unit, create_user, login, TEST_PASSWORD };
