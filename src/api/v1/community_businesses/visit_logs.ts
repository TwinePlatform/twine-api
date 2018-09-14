import * as Hapi from 'hapi';
import * as Boom from 'boom';
import * as Joi from 'joi';
import * as bcrypt from 'bcrypt';
import { omit, filter } from 'ramda';
import { query, response, id } from './schema';
import {
  User,
  Visitors,
  CommunityBusiness,
  CommunityBusinesses,
  GenderEnum } from '../../../models';
import { getCommunityBusiness } from '../prerequisites';
import { findAsync, valueIsSet } from '../../../utils';
import { filterQuery } from '../users/schema';
import { ApiRequestQuery } from '../schema/request';

interface VisitorSearchRequest extends Hapi.Request {
  payload: {
    userId: number
    visitActivityId: number
    qrCode: string
  };
}

export interface GetVisitLogsRequest extends Hapi.Request {
  query: ApiRequestQuery & {
    [k: string]: any
    filter?: {
      age?: [number, number]
      gender?: GenderEnum
      activity?: string
    }
  };
}

const routes: Hapi.ServerRoute[] = [
  {
    method: 'POST',
    path: '/community-businesses/me/visit-logs',
    options: {
      description: 'For users to adds a visit to their community business',
      auth: {
        strategy: 'standard',
        scope: ['visit_logs-own:write'],
      },
      validate: {
        query,
        payload: {
          userId: id.required(),
          visitActivityId: id.required(),
          qrCode: Joi.string().required(),
        },
      },
      response: { schema: response },
      pre: [
        { method: getCommunityBusiness, assign: 'communityBusiness' },
      ],
    },
    handler: async (request: VisitorSearchRequest, h) => {
      const { payload: { qrCode, userId, visitActivityId }, server: { app: { knex } } } = request;
      const communityBusiness = <CommunityBusiness> request.pre.communityBusiness;

      const visitors = await Visitors.fromCommunityBusiness(knex, communityBusiness);

      const visitor = await findAsync(visitors, (v: User) => bcrypt.compare(qrCode, v.qrCode));

      if (!visitor || visitor.id !== userId) {
        return Boom.badRequest('QR code invalid');
      }

      const activity = await CommunityBusinesses.getVisitActivityById(
        knex,
        communityBusiness,
        visitActivityId
      );

      return CommunityBusinesses.addVisitLog(knex, activity, visitor);
    },
  },
  {
    method: 'GET',
    path: '/community-businesses/me/visit-logs',
    options: {
      description: 'Retrieve a list of visit logs for your community business',
      auth: {
        strategy: 'standard',
        access: {
          scope: ['visit_logs-own:read'],
        },
      },
      validate: {
        query: {
          ...query,
          ...filterQuery,
        },
      },
      response: { schema: response },
      pre: [
        { method: getCommunityBusiness , assign: 'communityBusiness' },
      ],
    },
    handler: async (request: GetVisitLogsRequest, h: Hapi.ResponseToolkit) => {
      const {
        server: { app: { knex } },
        query: { limit, offset, filter: filterOptions = {} },
        pre: { communityBusiness } } = request;

      console.log({ filterOptions });

      // move to query definition to model
      const query = filter(valueIsSet, {
        offset,
        limit,
        where: omit(['age'], { ...filterOptions }),
        whereBetween: filterOptions.age
        ? {
          columnName: 'age',
          range: filterOptions.age }
        : {},
      });

      const visits = await CommunityBusinesses.getVisitLogs(
        knex,
        communityBusiness,
        query
        );

      const count = await CommunityBusinesses.getVisitLogs(
        knex,
        communityBusiness,
        omit(['limit', 'offset'], query)
        ).then((rows: any) => rows.length);

      return {
        meta: {
          total: count,
        },
        result: visits,
      };
    },
  },
  {
    method: 'GET',
    path: '/community-businesses/me/visit-logs/aggregates',
    options: {
      description: 'Retrieve a list of aggregated visit data for your scommunity businesses',
      auth: {
        strategy: 'standard',
        access: {
          scope: ['visit_logs-own:read'],
        },
      },
      validate: {
        query: {
          ...query,
          ...filterQuery,
        },
      },
      response: { schema: response },
      pre: [
        { method: getCommunityBusiness , assign: 'communityBusiness' },
      ],
    },
    handler: async (request: GetVisitLogsRequest, h: Hapi.ResponseToolkit) => {

      const {
        server: { app: { knex } },
        query: { filter: filterOptions = {}, fields },
        pre: { communityBusiness } } = request;

      // deal with this in the model
      const query = filter(valueIsSet, {
        where: omit(['age'], { ...filterOptions }),
        whereBetween: filterOptions.age
          ? {
            columnName: 'birthYear',
            range: filterOptions.age}
          : {},
      });

      return CommunityBusinesses.getVisitLogAggregates(knex, communityBusiness, fields, query);
    },
  },
];

export default routes;
