/*
 * onPreResponse Lifecycle hook
 *
 * This hook runs immediately before the response is sent, but after
 * all response validation
 *
 * Its purpose is to intercept any system runtime errors (either due to
 * uncaught or unhandled bugs or due to default Hapi framework responses)
 * and format them as required by the API.
 *
 * See also: https://hapijs.com/api#request-lifecycle
 */
import * as Hapi from 'hapi';
import * as Boom from 'boom';
import { formatBoom, BoomWithValidation } from '../utils';
import { Environment } from '../../../../config';
import { Users } from '../../../models';
import { StandardCredentials } from '../../../auth/strategies/standard';


export default async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const env = request.server.app.config.env;


  if (request.auth.credentials) { // only for authenticated routes
    const { user } = StandardCredentials.fromRequest(request);

    Users.addActiveDayEvent(request.server.app.knex, user, request.headers.origin)
      .then(() => {})
      .catch(() => {});
  }

  if ((<Boom<any>> request.response).isBoom) {
    const err = <BoomWithValidation> request.response;
    if (env !== Environment.TESTING) console.log(err);
    return h.response(formatBoom(err)).code(err.output.statusCode);
  } else {
    return h.continue;
  }
};
