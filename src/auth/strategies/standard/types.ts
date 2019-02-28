import * as Hapi from 'hapi';
import * as Boom from 'boom';
import * as Knex from 'knex';
import { User, Organisation } from '../../../models';
import { RoleEnum } from '../../types';


export type StandardUserCredentials = {
  user: User
  organisation: Organisation
  roles: RoleEnum[]
  session?: Session
};

export type Session = {
  userId: number
  organisationId: number
  iat: number
  exp: number
};

export type JwtPayload = Session;

export type Token = string;

export type TTokenManager = {
  create: (s: Pick<Session, 'userId' | 'organisationId'>) => Token
  verify: (t: Token) => Session
  decode: (t: Token) => Session
};

export type TSessionManager = {
  create: (
    request: Hapi.Request,
    res: Hapi.ResponseObject,
    p: Pick<Session, 'userId' | 'organisationId'>
  ) => Hapi.ResponseObject
  refresh: (request: Hapi.Request, res: Hapi.ResponseObject) => Hapi.ResponseObject
  destroy: (request: Hapi.Request, res: Hapi.ResponseObject) => Hapi.ResponseObject
};

export type ValidateUser = (a: Session, b: Hapi.Request) =>
  Promise <{credentials?: Hapi.AuthCredentials, isValid: boolean } | Boom<null>>;

export type TCredentials = {
  get: (k: Knex, u: User, o: Organisation, s?: Session) =>
    Promise<Hapi.AuthCredentials>

  fromRequest: (r: Hapi.Request) =>
    StandardUserCredentials & { scope: string[] }
};
