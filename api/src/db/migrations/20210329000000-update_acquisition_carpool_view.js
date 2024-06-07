"use strict";
/**
 * Cast all foreign keys *_id as integer to match PostgreSQL types
 * Current type is 'varchar' as fkeys were migrated from MongoDB
 * as a toString() of ObjectID objects.
 */
import { createMigration } from "../helpers/createMigration.js";

var { setup, up, down } = createMigration([
  "acquisition/20210329000000_update_acquisition_carpools",
], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
