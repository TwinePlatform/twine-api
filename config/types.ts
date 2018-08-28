import * as Knex from 'knex';

export enum Environment {
  DEVELOPMENT = 'development',
  TESTING = 'testing',
  PRODUCTION = 'production',
}

type WebConfig = {
  host: string,
  port: number | string,
  router: { stripTrailingSlash: boolean }
  tls: null | { key: string, cert: string }
};

type EmailConfig = {
  postmark_key: string
};

type SecretConfig = {
  jwt_secret: string
};

type QrCodeConfig = {
  secret: string
};

export type Config = {
  root: string
  env: Environment
  web: WebConfig
  knex: Knex.Config
  email: EmailConfig
  secret: SecretConfig
  qrcode: QrCodeConfig
};
