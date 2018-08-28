import * as path from 'path';
import { Environment } from './types';

export default {
  env: Environment.DEVELOPMENT,
  web: {
    port: 4000,
    routes: {
      cors: {
        origin: ['http://localhost:3000'],
      },
    },
  },
  knex: {
    client: 'pg',
    connection: process.env.DATABASE_URL_DEVELOPMENT,
    pool: {
      min: 3,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: path.resolve(process.cwd(), 'database', 'migrations'),
    },
    seeds: {
      directory: path.resolve(process.cwd(), 'database', 'seeds', 'development'),
    },
  },
  email: {
    postmark_key: process.env.POSTMARK_KEY_DEVELOPMENT,
  },
  cookies: {
    token : {
      isSecure: false,
    },
  },
};
