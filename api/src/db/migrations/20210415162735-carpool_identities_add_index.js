"use strict";
/**
 * Cast all foreign keys *_id as integer to match PostgreSQL types
 * Current type is 'varchar' as fkeys were migrated from MongoDB
 * as a toString() of ObjectID objects.
 */
import { createMigration } from "../helpers/createMigration.js";

var { setup, up, down } = createMigration([
  "carpool/20210415162735-carpool_identities_add_index",
], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
