import path from 'node:path';

import { config as load_env } from 'dotenv';
import knex from 'knex';
import { register } from 'tsx/cjs/api';

// O knex importa os arquivos de migration (.ts) via `require` nativo, fora do
// transform do Vitest — registramos o loader do tsx para que consiga carregá-los.
register();

// O globalSetup do Vitest roda fora do runtime de testes, então o alias `~/`
// não está disponível aqui — montamos a conexão a partir do .env.test.
load_env({ path: '.env.test', quiet: true });

const migrations_directory = path.join(__dirname, '..', 'src', 'database', 'migrations');

function create_connection() {
  return knex({
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: {
      tableName: 'migrations',
      directory: migrations_directory,
    },
  });
}

// Executado uma vez antes de toda a suíte: aplica as migrations no banco de teste.
async function setup() {
  const db = create_connection();

  try {
    await db.migrate.latest();
  } finally {
    await db.destroy();
  }
}

// Executado uma vez após toda a suíte: desfaz as migrations e fecha a conexão.
async function teardown() {
  const db = create_connection();

  try {
    await db.migrate.rollback({}, true);
  } finally {
    await db.destroy();
  }
}

export { setup, teardown };
