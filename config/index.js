/*
 * Configuration entry point
 *
 * Exports functions used to generate a single normalised configuration object
 */
require('dotenv').config({ path: './config/.env' });

const fs = require('fs');
const url = require('url');
const Joi = require('joi');
const { mergeDeepRight } = require('ramda');
const schema = require('./config.schema');
const defaults = require('./config.defaults');
const devConfig = require('./config.development');
const testConfig = require('./config.testing');
const prodConfig = require('./config.production');
const { DEVELOPMENT, TESTING, PRODUCTION } = require('./environments');


/**
 * Parses database connection string into connection object
 * used by node-postgres Client constructor
 *
 * @param   {String} str Database URL to parse
 * @returns {Object}     Database connection parameters
 */
const parseDbUrl = (str) => {
  const {
    auth,
    pathname: database,
    hostname: host,
    port,
    query: { ssl },
  } = url.parse(str, true);

  const [user, password] = auth.split(':');

  return { database: database.slice(1), host, port, user, password, ssl: Boolean(ssl) };
};


/**
 * Describes the transformations of the default configuration object
 * in the various supported deployment environments
 */
const nodeEnvs = {
  [DEVELOPMENT]: (cfg) => mergeDeepRight(cfg, devConfig),

  [TESTING]: (cfg) => mergeDeepRight(cfg, testConfig),

  [PRODUCTION]: (cfg) => mergeDeepRight(cfg, prodConfig),
};


/**
 * Given the deployment environment, applies the appropriate
 * transformations to the default config.
 *
 * Allows an optional filepath for a config override JSON file.
 *
 * @param   {String} [env=dev] Environment for which to get config
 * @param   {String} [path]    Path from which to read optional config file
 * @returns {Object}           Fully merged configuration object
 */
const readConfig = (env = DEVELOPMENT, path) => {
  const config = path
    ? JSON.parse(fs.readFileSync(path, 'utf8'))
    : {};

  return mergeDeepRight(nodeEnvs[env](defaults), config);
};


/**
 * Validates the given configuration object against the default schema
 *
 * @param   {Object} cfg Configuration object to validate
 * @returns {Object}     Parsed and validated configuration object
 */
const validateConfig = (cfg) => {
  const { error, value } = Joi.validate(cfg, schema);

  if (error) {
    throw error;
  }

  return value;
};

/**
 * Utility shortcut for reading and validating configuration
 * @param   {String} env    Deployment environment
 * @param   {String} [path] Optional path for configuration override file
 * @returns {Object}        Validated configuration object
 */
const getConfig = (env, path) => validateConfig(readConfig(env, path));


module.exports = {
  readConfig,
  validateConfig,
  getConfig,
  DEVELOPMENT,
  TESTING,
  PRODUCTION,
};
