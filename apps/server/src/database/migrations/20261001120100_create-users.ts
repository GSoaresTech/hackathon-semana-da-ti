import type { Knex } from 'knex';

// Usuários da recepção das unidades (login simples). Nenhum dado de paciente.
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.string('name').notNullable();
    // Só dígitos, com DDD (ex.: 81990000001).
    table.string('phone', 11).notNullable().unique();
    table.string('password_hash').notNullable();
    table.uuid('unit_id').notNullable().references('id').inTable('units').onDelete('CASCADE');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('users');
}
