import knex from 'knex';

import { config } from '~/database/config';
import { env } from '~/libs/environments';

const connection = knex(config[env.NODE_ENV]);

export { connection };
