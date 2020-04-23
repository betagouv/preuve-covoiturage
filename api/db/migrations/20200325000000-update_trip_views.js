'use strict';
/**
 * Cast all foreign keys *_id as integer to match PostgreSQL types
 * Current type is 'varchar' as fkeys were migrated from MongoDB
 * as a toString() of ObjectID objects.
 */
var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration([
  'trip/202003250000000_update_trip_view',
  'trip/202003250000000_update_export_view',
], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
