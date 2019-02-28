import * as JWT from 'jsonwebtoken';
import { getConfig } from '../../../../config';
import { TTokenManager, TSessionManager, Session } from './types';
import { StandardCredentials } from './validate';


const {
  auth: {
    standard: {
      cookie: { name: cookieName },
      jwt: { secret: jwtSecret, signOptions, verifyOptions },
    },
  },
} = getConfig(process.env.NODE_ENV);

export const TokenManager: TTokenManager = {
  create (s) {
    return JWT.sign({ ...s, version: 'v1' }, jwtSecret, signOptions);
  },

  verify (s) {
    return <Session> JWT.verify(s, jwtSecret, verifyOptions);
  },

  decode (s) {
    return <Session> JWT.decode(s);
  },
};

export const SessionManager: TSessionManager = {
  create (request, res, payload) {
    const session = { ...payload };

    const token = TokenManager.create(session);

    return res.state(cookieName, token);
  },

  refresh (request, res) {
    const { session } = StandardCredentials.fromRequest(request);

    const token = TokenManager.create(session);

    return res.state(cookieName, token);
  },

  destroy (request, res) {
    return res.unstate(cookieName);
  },
};
