import * as Hapi from 'hapi';
import * as Boom from 'boom';
import * as Joi from 'joi';
import { response, since, until, query, id } from '../schema';
import { VolunteerLogs, Duration } from '../../../../models';
import { getCommunityBusiness } from '../../prerequisites';
import {
  GetMyVolunteerLogsRequest,
  GetVolunteerLogRequest,
  PutMyVolunteerLogRequest,
  GetMyVolunteerLogsAggregateRequest,
} from '../../types';


const routes: Hapi.ServerRoute[] = [

  {
    method: 'GET',
    path: '/users/volunteers/me/volunteer-logs',
    options: {
      description: 'Read own volunteer logs',
      auth: {
        strategy: 'standard',
        access: {
          // TO BE REPLACED: "parent" with "own"
          scope: ['volunteer_logs-parent:read'],
        },
      },
      validate: {
        query: { since, until, ...query },
      },
      response: { schema: response },
      pre: [
        { method: getCommunityBusiness, assign: 'communityBusiness' },
      ],
    },
    handler: async (request: GetMyVolunteerLogsRequest, h) => {
      const {
        server: { app: { knex } },
        auth: { credentials: { user } },
        pre: { communityBusiness },
        query,
      } = request;

      const since = new Date(query.since);
      const until = new Date(query.until);

      const logs = await VolunteerLogs.fromUserAtCommunityBusiness(
        knex,
        user,
        communityBusiness,
        { since, until, limit: query.limit, offset: query.offset }
      );

      return Promise.all(logs.map(VolunteerLogs.serialise));
    },
  },

  {
    method: 'GET',
    path: '/users/volunteers/me/volunteer-logs/{logId}',
    options: {
      description: 'Read own volunteer logs',
      auth: {
        strategy: 'standard',
        access: {
          // TO BE REPLACED: "parent" with "own"
          scope: ['volunteer_logs-parent:read'],
        },
      },
      validate: {
        query: { fields: query.fields },
        params: { logId: id },
      },
      response: { schema: response },
      pre: [
        { method: getCommunityBusiness, assign: 'communityBusiness' },
      ],
    },
    handler: async (request: GetVolunteerLogRequest, h) => {
      const {
        server: { app: { knex } },
        auth: { credentials: { user } },
        pre: { communityBusiness },
        params: { logId },
        query,
      } = request;

      const log = await VolunteerLogs.getOne(
        knex,
        {
          where: {
            id: Number(logId),
            userId: user.id,
            organisationId: communityBusiness.id,
            deletedAt: null,
          },
          fields: query.fields,
        }
      );

      return !log
        ? Boom.notFound('No log with this id found under this account')
        : VolunteerLogs.serialise(log);
    },
  },

  {
    method: 'PUT',
    path: '/users/volunteers/me/volunteer-logs/{logId}',
    options: {
      description: 'Update own volunteer logs',
      auth: {
        strategy: 'standard',
        access: {
          // TO BE REPLACED: "parent" with "own"
          scope: ['volunteer_logs-parent:write'],
        },
      },
      validate:  {
        params: { logId: id },
        payload: {
          activity: Joi.string(),
          duration: Joi.object({
            hours: Joi.number().integer().min(0),
            minutes: Joi.number().integer().min(0),
            seconds: Joi.number().integer().min(0),
          }),
          startedAt: Joi.date().iso().max('now'),
        },
      },
      response: { schema: response },
      pre: [
        { method: getCommunityBusiness, assign: 'communityBusiness' },
      ],
    },
    handler: async (request: PutMyVolunteerLogRequest, h) => {
      const {
        server: { app: { knex } },
        auth: { credentials: { user } },
        payload,
        pre: { communityBusiness },
        params: { logId },
      } = request;

      const log = await VolunteerLogs.getOne(knex, { where: {
        id: Number(logId),
        userId: user.id,
        organisationId: communityBusiness.id,
        deletedAt: null,
      }});

      if (!log) {
        return Boom.notFound('No log with this id found under this account');
      }

      const updatedLog = await VolunteerLogs.update(knex, log, { ...payload });

      return VolunteerLogs.serialise(updatedLog);
    },
  },

  {
    method: 'DELETE',
    path: '/users/volunteers/me/volunteer-logs/{logId}',
    options: {
      description: 'Delete own volunteer logs',
      auth: {
        strategy: 'standard',
        access: {
          // TO BE REPLACED: "parent" with "own"
          scope: ['volunteer_logs-parent:write'],
        },
      },
      validate: {
        params: { logId: id },
      },
      response: { schema: response },
      pre: [
        { method: getCommunityBusiness, assign: 'communityBusiness' },
      ],
    },
    handler: async (request: PutMyVolunteerLogRequest, h) => {
      const {
        server: { app: { knex } },
        auth: { credentials: { user } },
        pre: { communityBusiness },
        params: { logId },
      } = request;

      const affectedRows = await VolunteerLogs.destroy(knex, {
        id: Number(logId),
        userId: user.id,
        organisationId: communityBusiness.id,
        deletedAt: null,
      });

      return affectedRows === 0
        ? Boom.notFound('No log with this id found under this account')
        : null;
    },
  },

  {
    method: 'GET',
    path: '/users/volunteers/me/volunteer-logs/summary',
    options: {
      description: 'Read own volunteer logs summary',
      auth: {
        strategy: 'standard',
        access: {
          // TO BE REPLACED: "parent" with "own"
          scope: ['volunteer_logs-parent:read'],
        },
      },
      validate: {
        query: { since, until },
      },
      response: { schema: response },
      pre: [
        { method: getCommunityBusiness, assign: 'communityBusiness' },
      ],
    },
    handler: async (request: GetMyVolunteerLogsAggregateRequest, h) => {
      const {
        server: { app: { knex } },
        auth: { credentials: { user } },
        pre: { communityBusiness },
        query,
      } = request;

      const since = new Date(query.since);
      const until = new Date(query.until);

      const logs = await VolunteerLogs.fromUserAtCommunityBusiness(
        knex,
        user,
        communityBusiness,
        { since, until, limit: query.limit, offset: query.offset }
      );

      const total = logs.reduce((acc, log) =>
        Duration.sum(acc, log.duration), Duration.fromSeconds(0));

      return { total };
    },
  },

];

export default routes;
