import * as Hapi from 'hapi';
import * as Joi from 'joi';
import * as moment from 'moment';
import { compose, omit, pick, mergeDeepRight } from 'ramda';
import { Visitors, User, ModelQuery } from '../../../../models';
import { query, filterQuery, response } from '../schema';
import { GetVisitorsRequest } from '../../types';


const routes: Hapi.ServerRoute[] = [
  {
    method: 'GET',
    path: '/users/visitors',
    options: {
      description: 'Retreive list of all visitors',
      validate: {
        query: {
          ...query,
          ...filterQuery,
          visits: Joi.boolean().default(false),
        },
      },
      response: { schema: response },
    },
    handler: async (request: GetVisitorsRequest, h: Hapi.ResponseToolkit) => {
      const { knex, query } = request;
      const { visits, filter, fields: _fields } = query;

      const q: {
        limit?: number,
        offset?: number,
        order?: [string, 'asc' | 'desc']
      } = {
        ...pick(['limit', 'offset'], query),
        order: query.sort ? [query.sort, query.order || 'asc'] : undefined,
      };

      const ageToBirthYear = (age: number) => moment().year() - age;

      // fields
      // TODO: Need to actually filter the object
      const fields = <(keyof User)[]> _fields;

      const modelQuery: ModelQuery<User> = { fields, ...q, where: { deletedAt: null } };

      // age filter
      if (filter && filter.age) {
        modelQuery.whereBetween = mergeDeepRight(
          modelQuery.whereBetween || {},
          { birthYear: [filter.age.map(ageToBirthYear)] }
        );
      }

      // activity filter
      if (filter && filter.activity) {
        modelQuery.where = mergeDeepRight(
          modelQuery.where || {},
          { activity: filter.activity }
        );
      }

      // gender filter
      if (filter && filter.gender) {
        modelQuery.where = mergeDeepRight(
          modelQuery.where || {},
          { gender: filter.gender }
        );
      }

      const visitors = await (visits
        ? Visitors.getWithVisits(knex, modelQuery)
        : Visitors.get(knex, modelQuery));

      return Promise.all(visitors.map(Visitors.serialise));
    },
  },
];

export default routes;
