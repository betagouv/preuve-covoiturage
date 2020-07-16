'use strict';
/**
 * Cast all foreign keys *_id as integer to match PostgreSQL types
 * Current type is 'varchar' as fkeys were migrated from MongoDB
 * as a toString() of ObjectID objects.
 */
var { createMigration } = require('../helpers/createMigration');

var { setup, up, down } = createMigration(
  [
    'company/20200406000000_update_company_table',
    'territory/20200406000000_update_territory_table',
    'territory/20200406000001_migrate_territory_data',

    'territory/20200606000000_create_territory_view_table',
    'territory/20200606000001_create_territory_view_data_func',
    'territory/20200606000001_create_territory_view_territory_triggers',
    'territory/20200606000002_create_territory_view_relation_triggers',
    'territory/20200606000003_create_territory_view_code_triggers',
    'territory/20200606000004_populate_territory_view',

    'auth/20200406000000_update_territory_user_relation',
    'policy/20200406000000_update_territory_policy_relation',
    'policy/20200406000000_update_policy_trip_view',
    'carpool/20200406000000_replace_insee_by_territory_relation',
    'trip/20200406000000_update_trip_view',
    'territory/20200406000010_cleanup_territory_table',
    'common/20200406000000_drop_insee_table',
  ],
  __dirname,
);

exports.setup = setup;
exports.up = up;
exports.down = down;
