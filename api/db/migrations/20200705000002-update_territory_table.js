'use strict';
/**
 * Cast all foreign keys *_id as integer to match PostgreSQL types
 * Current type is 'varchar' as fkeys were migrated from MongoDB
 * as a toString() of ObjectID objects.
 */
var { createMigration } = require('../helpers/createMigration');

var { setup, up, down } = createMigration(
  [
    'territory/20200606000001_create_territory_view_data_func',
    'territory/20200606000001_create_territory_view_territory_triggers',
    'territory/20200606000002_create_territory_view_relation_triggers',
    'territory/20200606000003_create_territory_view_code_triggers',
    'territory/20200606000004_populate_territory_view',
  ],
  __dirname,
);

exports.setup = setup;
exports.up = up;
exports.down = down;
