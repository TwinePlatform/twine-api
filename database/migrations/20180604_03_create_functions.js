const { buildQueryFromFile } = require('..');

exports.up = buildQueryFromFile(__filename);
