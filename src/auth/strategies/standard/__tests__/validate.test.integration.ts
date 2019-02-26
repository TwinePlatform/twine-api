import * as Hapi from 'hapi';
import * as jwt from 'jsonwebtoken';
import { init } from '../../../../server';
import { getConfig } from '../../../../../config';


describe('Internal auth scheme', () => {
  let server: Hapi.Server;
  const config = getConfig(process.env.NODE_ENV);
  const { auth: { standard: { jwt: { secret }, cookie: { name: cookieName } } } } = config;

  beforeAll(async () => {
    server = await init(config);
  });

  afterAll(async () => {
    await server.shutdown(true);
  });

  test('SUCCESS - Token needed for authorised routes', async () => {
    const token = jwt.sign({ userId: 2, organisationId: 1 }, secret);
    const response = await server.inject({
      method: 'GET',
      url: '/v1/users',
      headers: { cookie: `${cookieName}=${token}` },
    });
    expect(response.statusCode).toBe(200);
  });

  test('FAIL - Token with missing userId is unauthorised', async () => {
    const token = jwt.sign({}, secret);
    const response = await server.inject({
      method: 'GET',
      url: '/v1/users',
      headers: { cookie: `${cookieName}=${token}` },
    });
    expect(response.statusCode).toBe(401);
  });

  test('FAIL - User with no role is unauthorised', async () => {
    const token = jwt.sign({ userId: 4, organisationId: 1 }, secret);
    const response = await server.inject({
      method: 'GET',
      url: '/v1/users',
      headers: { cookie: `${cookieName}=${token}` },
    });
    expect(response.statusCode).toBe(401);
  });

  test('FAIL - User no role at different organisation is unauthorised', async () => {
    const token = jwt.sign({ userId: 3, organisationId: 1 }, secret);
    const response = await server.inject({
      method: 'GET',
      url: '/v1/users',
      headers: { cookie: `${cookieName}=${token}` },
    });
    expect(response.statusCode).toBe(401);
  });

  test('SUCCESS - Token not needed for open routes', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/',
    });
    expect(response.statusCode).toBe(200);
  });
});
