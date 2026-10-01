import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('units', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.string('name').notNullable();
    table
      .enu('type', ['ubs', 'upa', 'emergency_room', 'hospital', 'clinic', 'telemedicine'], {
        useNative: true,
        enumName: 'unit_type',
      })
      .notNullable();
    table
      .enu('network', ['public', 'private'], { useNative: true, enumName: 'unit_network' })
      .notNullable();
    table.string('address');
    table.string('neighborhood');
    // Nulos na teleconsulta, que não tem endereço físico.
    table.double('lat');
    table.double('lng');
    table
      .enu('occupancy', ['low', 'medium', 'high'], { useNative: true, enumName: 'unit_occupancy' })
      .notNullable()
      .defaultTo('low');
    table.string('opening_hours').notNullable();
    table.string('phone');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('units');
  await knex.raw('DROP TYPE IF EXISTS unit_type, unit_network, unit_occupancy');
}
