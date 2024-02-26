'use strict';
/**
 * Cast all foreign keys *_id as integer to match PostgreSQL types
 * Current type is 'varchar' as fkeys were migrated from MongoDB
 * as a toString() of ObjectID objects.
 */
var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration(
  ['acquisition/20200408000000-add_journey_id_acquisition_id_to_error'],
  __dirname,
);

exports.setup = setup;
exports.up = up;
exports.down = down;
