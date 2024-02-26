'use strict';
/**
 * Cast all foreign keys *_id as integer to match PostgreSQL types
 * Current type is 'varchar' as fkeys were migrated from MongoDB
 * as a toString() of ObjectID objects.
 */
var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration(
  [
    'fraudcheck/20200410000000_update_fraudcheck_fkeys',
    'fraudcheck/20200410000000_create_method_repository_table',
    'fraudcheck/20200410000000_create_processable_carpool_view',
    'carpool/20200410000000_update_carpool_status',
  ],
  __dirname,
);

exports.setup = setup;
exports.up = up;
exports.down = down;
