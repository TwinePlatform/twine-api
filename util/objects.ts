/*
 * Utilities for objects
 */
import { curry, assoc, pick, Dictionary } from 'ramda';


export const mapKeys =
  curry(
    (f: (s: string) => string, o: Dictionary<any>) =>
      Object.keys(o).reduce((acc, k) => assoc(f(k), o[k], acc), {})
  );

export const renameKeys =
  curry(
    (map: Dictionary<string>, o: Dictionary<any>) =>
      Object.keys(o)
        .reduce((acc, k) => assoc(map[k] || k, o[k], acc), {})
  );

export const pickOrAll = curry(
  (xs: string[] | undefined, o: object) => xs ? pick(xs, o) : { ...o });
