'use strict';
/**
 * Cast all foreign keys *_id as integer to match PostgreSQL types
 * Current type is 'varchar' as fkeys were migrated from MongoDB
 * as a toString() of ObjectID objects.
 */
var { createMigration } = require('../helpers/createMigration');

var { setup, up, down } = createMigration(
  [
    // add _id to company.companies
    'company/20200406000000_update_company_table',

    /**
     * Create new territory.territories table
     * Create territory.territory_codes table
     * Create territory.territory_relation table
     */
    'territory/20200406000000_update_territory_table',
  ],
  __dirname,
);

exports.setup = setup;
exports.up = up;
exports.down = down;
