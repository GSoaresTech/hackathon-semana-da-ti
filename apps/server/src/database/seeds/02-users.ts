import type { Knex } from 'knex';

import { hash_password } from '~/libs/hash';

/*
 * Um usuário de recepção por unidade presencial, todos com a senha `triar123`.
 * Telefones fictícios em sequência (81990000001, 81990000002, ...), na ordem
 * alfabética das unidades — veja a tabela no README da raiz.
 */
const DEFAULT_PASSWORD = 'triar123';

export async function seed(knex: Knex): Promise<void> {
  await knex('users').del();

  const units = await knex('units')
    .select('id', 'name')
    .whereNot('type', 'telemedicine')
    .orderBy('name');

  const password_hash = await hash_password(DEFAULT_PASSWORD);

  await knex('users').insert(
    units.map((unit, index) => ({
      name: `Recepção ${unit.name}`,
      phone: `8199000${String(index + 1).padStart(4, '0')}`,
      password_hash,
      unit_id: unit.id,
    })),
  );
}
