'use strict';
/**
 * Cast all foreign keys *_id as integer to match PostgreSQL types
 * Current type is 'varchar' as fkeys were migrated from MongoDB
 * as a toString() of ObjectID objects.
 */
var { createMigration } = require('../helpers/createMigration');

var { setup, up, down } = createMigration([
    'policy/20210901000000_update_policy_meta',
    'policy/20210901000000_update_policy_trip_view',
    'trip/20210901000000_add_territory_index'
], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
