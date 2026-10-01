import path from 'node:path';

import type { Knex } from 'knex';

import { env } from '~/libs/environments';

const config: Record<'development' | 'staging' | 'production' | 'test', Knex.Config> = {
  development: {
    client: 'pg',
    connection: env.DATABASE_URL,
    migrations: {
      tableName: 'migrations',
      directory: path.join(__dirname, 'migrations'),
    },
    seeds: {
      directory: path.join(__dirname, 'seeds'),
      timestampFilenamePrefix: false,
    },
  },

  staging: {
    client: 'pg',
    connection: env.DATABASE_URL,
    debug: true,
    migrations: {
      tableName: 'migrations',
      directory: path.join(__dirname, 'migrations'),
    },
    seeds: {
      directory: path.join(__dirname, 'seeds'),
    },
  },

  production: {
    client: 'pg',
    connection: env.DATABASE_URL,
    migrations: {
      tableName: 'migrations',
      directory: path.join(__dirname, 'migrations'),
    },
    seeds: {
      directory: path.join(__dirname, 'seeds'),
    },
  },

  test: {
    client: 'pg',
    connection: env.DATABASE_URL,
    migrations: {
      tableName: 'migrations',
      directory: path.join(__dirname, 'migrations'),
    },
    seeds: {
      directory: path.join(__dirname, 'seeds'),
      timestampFilenamePrefix: false,
    },
  },
};

export { config };
