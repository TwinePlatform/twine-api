/*
 * Route pre-requisite for fetching community business model based on path parameter
 *
 * Supports:
 * - Fetching, using 'me' as the ID, the org that the user is authenticated with
 * - Fetching the org using a database ID
 * - Fetching the org using a 360 Giving ID
 */
import * as Hapi from 'hapi';
import * as Boom from 'boom';
import { isNil } from 'ramda';
import { CommunityBusinesses } from '../../../models';
import { GetCommunityBusinessRequest } from '../types';
import { Credentials } from '../../../auth/strategies/standard';


export const is360GivingId = (s: string) => isNaN(parseInt(s, 10));
const getCbFromCredentials = async (request: GetCommunityBusinessRequest) => {
  const knex = request.server.app.knex;
  const id = Credentials.fromRequest(request).organisation.id;
  return CommunityBusinesses.getOne(knex, { where: { id } });
};

export default async (request: GetCommunityBusinessRequest, h: Hapi.ResponseToolkit) => {
  const { params: { organisationId: id }, server: { app: { knex } } } = request;

  const communityBusiness =
    (id === 'me' || isNil(id))
      ? await getCbFromCredentials(request)
      : (is360GivingId(id))
        ? await CommunityBusinesses.getOne(knex, { where: { _360GivingId: id } })
        : await CommunityBusinesses.getOne(knex, { where: { id: Number(id) } });

  if (! communityBusiness) {
    throw Boom.notFound('No associated community business');
  }

  return communityBusiness;
};
