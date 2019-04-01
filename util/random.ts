/*
 * Utilities for getting random quantities
 */
import * as moment from 'moment';


export const number =
  (max: number, min = 0) => (max - min) * Math.random() + min;

export const integer =
  (max: number, min = 0) => Math.round(number(max, min));

export const element =
  <T>(xs: T[]) => xs[integer(xs.length)] || xs[0];

export const date =
  (from: Date, to: Date) => new Date(integer(from.valueOf(), to.valueOf()));

export const dateThisMonth =
  () => date(moment().startOf('month').toDate(), new Date());
