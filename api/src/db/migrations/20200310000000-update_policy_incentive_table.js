'use strict';
/**
 * Cast all foreign keys *_id as integer to match PostgreSQL types
 * Current type is 'varchar' as fkeys were migrated from MongoDB
 * as a toString() of ObjectID objects.
 */
var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration([
  'carpool/20200310000000_update_carpool_table',
  'policy/20200310000000_update_policy_incentive',
  'policy/20200310000000_update_policy_trip_view',
  'policy/20200310000000_update_policy_meta',
], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
