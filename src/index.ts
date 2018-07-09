/*
 * Twine API entry point
 */
import { inspect } from 'util';
import { compose, tap } from 'ramda';
import { init, start } from './server';
const { getConfig } = require('../config');

const logConfig = (config: any) => {
  console.log(`Attempting to start twine-api in "${config.env}" environment.`);
  console.log('Using the following configuration');
  console.log(inspect(config, { depth: 3 }));
};

const up = compose(
  (p) => p.then(start),
  init,
  tap(logConfig),
  getConfig
);

up(process.env.NODE_ENV)
  .then((server) => `twine-api listening on ${server.info.uri}`)
  .catch(console.error);
