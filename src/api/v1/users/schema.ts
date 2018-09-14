/*
 * Route validation schema for User routes
 */
import * as Joi from 'joi';
import { gender } from '../schema/request';

export { query, gender, id } from '../schema/request';
export { response } from '../schema/response';

const currentYear = (new Date()).getFullYear();

/*
 * Common request schema
 */
export const userName =
  Joi.string()
    .min(3)
    .max(100)
    .regex(/[^\w\s\d]/, { name: 'alphanumeric', invert: true })
    .lowercase();

export const birthYear =
  Joi.number()
    .integer()
    .min(1890)
    .max(currentYear);

export const email =
  Joi.string()
    .email()
    .lowercase();

export const password =
  Joi.string()
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/, 'strong_pwd')
    .options({ language: { string: { regex: { name: 'is too weak' } } } });

export const phoneNumber =
  Joi.string()
    .min(11)
    .max(14);

export const postCode =
  Joi.string()
    .min(4)
    .max(10)
    .uppercase();

export const isEmailConsentGranted =
  Joi.boolean();

export const isSMSConsentGranted =
  Joi.boolean();

export const disability =
  Joi.string().only(['yes', 'no', 'prefer not to say']);

export const ethnicity =
  Joi.string();

/*
 *
 */
export const filterQuery = {
  filter: Joi.object({
    age: Joi.array().length(2).items(Joi.number().integer().min(0)),
    visitActivity: Joi.string(),
    gender,
  }),
};
