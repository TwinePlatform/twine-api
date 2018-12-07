import * as Hapi from 'hapi';
import * as Cookie from 'cookie';
import * as JWT from 'jsonwebtoken';
import { compose, evolve, omit } from 'ramda';
import { getConfig } from '../../../config';
import { Session } from '../../auth/strategies/standard/types';


const { auth: { standard } } = getConfig(process.env.NODE_ENV);

const extractCookie = (c: string) => Cookie.parse(c)[standard.cookie.name];

const extractBearerToken = (c: string = '') => c.split('Bearer ')[1] || c || '';

const extractToken = (headers: Hapi.Util.Dictionary<string>) =>
  headers.cookie
    ? extractCookie(headers.cookie)
    : extractBearerToken(headers.authorization);

const decodeToken = (c: string): Partial<Session> => {
  let decoded: Partial<Session>;
  try {
    decoded = <any> JWT.verify(c, standard.jwt.secret, standard.jwt.verifyOptions);

  } catch (error) {
    decoded = {};
  }

  return decoded;
};

const getIds = compose(decodeToken, extractToken);

const attachUserId = (req: { headers: Hapi.Util.Dictionary<string> }) => {
  const { userId, organisationId } = getIds(req.headers);
  return { ...req, userId, organisationId };
};


export default {
  req: compose(
    omit(['id']),
    evolve({
      headers: omit([
        'host',
        'accept',
        'accept-encoding',
        'accept-language',
        'connection',
        'dnt',
        'upgrade-insecure-requests',
      ]),
    }),
    attachUserId
  ),

  payload: omit(['password', 'passwordConfirm', 'confirmPassword']),

  res: evolve({
    headers: omit([
      'content-type',
      'vary',
      'access-control-allow-origin',
      'access-control-allow-credentials',
      'access-control-expose-headers',
      'strict-transport-security',
      'x-frame-options',
      'x-xss-protection',
      'x-download-options',
      'x-content-type-options',
      'cache-control',
      'set-cookie',
      'accept-ranges',
    ]),
  }),
};
