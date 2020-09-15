'use strict';
/**
 * Cast all foreign keys *_id as integer to match PostgreSQL types
 * Current type is 'varchar' as fkeys were migrated from MongoDB
 * as a toString() of ObjectID objects.
 */
var { createMigration } = require('../helpers/createMigration');

var { setup, up, down } = createMigration(['carpool/20200406000000_replace_insee_by_territory_relation'], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
