import * as fs from 'fs';
import * as path from 'path';
import * as Knex from 'knex';
import { compose, head } from 'ramda';
import { File } from '../../util';

const MIGRATIONS_BASE_PATH = path.resolve(__dirname, '..', 'migrations');

export const buildQuery = (path: string) =>
  (knex: Knex) => compose((s) => knex.raw(s), File.sync.read)(path);

export const buildPath = (fname: string) =>
  head(fname
    .split('/')
    .slice(-1)
    .map((s) => s.replace('.ts', '.sql'))
    .map((s) => path.resolve(MIGRATIONS_BASE_PATH, 'sql', s)));

export const buildQueryFromFile = compose(buildQuery, buildPath);

export const write = File.sync.write;
