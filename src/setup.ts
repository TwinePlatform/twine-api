/*
 * Pre-requisites, global objects and other setup
 */
import { Config } from '../config/types';

import * as Hapi from 'hapi';
import * as Knex from 'knex';

declare module 'hapi' {
  interface Server {
    shutdown: (a?: boolean) => Promise<void>;
  }
}

export default (server: Hapi.Server, config: Config) => {
  server.app.config = config;
  server.app.knex = Knex(config.knex);

  server.decorate('request', 'knex', server.app.knex);

  server.decorate('server', 'shutdown', async (graceful) => {
    if (graceful) {
      await server.app.knex.destroy();
      return server.stop();

    } else {
      return process.exit(1);

    }
  });
};
