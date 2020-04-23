'use strict';
/**
 * Cast all foreign keys *_id as integer to match PostgreSQL types
 * Current type is 'varchar' as fkeys were migrated from MongoDB
 * as a toString() of ObjectID objects.
 */
var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration([
  'company/20200406000000_update_company_table',
  'territory/20200406000000_update_territory_table',
  'territory/20200406000001_migrate_territory_data',
  'territory/20200406000002_create_territory_view',
  'auth/20200406000000_update_territory_user_relation',
  'policy/20200406000000_update_territory_policy_relation',
  'carpool/20200406000000_replace_insee_by_territory_relation',
  'trip/20200406000000_update_trip_view',
  'trip/20200406000000_update_export_view',
  'territory/20200406000010_cleanup_territory_table',
  'common/20200406000000_drop_insee_table',
], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
