/*
 * Route validation schema for Community business routes
 */
import * as Joi from 'joi';
import { query } from '../users/schema';


export { query } from '../schema/request';
export { response } from '../schema/response';

export const since = Joi.date().iso().default(0);
export const until = Joi.date().iso().default(() => Date.now(), 'Current date');

export const visitActivitiesGetQuery = {
  ...query,
  day: Joi.allow([
    'today',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'satday',
    'sunday',
  ]),
};

export const visitActivitiesPostPayload = {
  name: Joi.string().required(),
  category: Joi.string().required(),
};

export const visitActivitiesPutPayload = {
  category: Joi.string().min(3),
  monday: Joi.boolean(),
  tuesday: Joi.boolean(),
  wednesday: Joi.boolean(),
  thursday: Joi.boolean(),
  friday: Joi.boolean(),
  saturday: Joi.boolean(),
  sunday: Joi.boolean(),
};

export const id = Joi.number().positive().required();
export const meOrId = id.allow('me').required();
