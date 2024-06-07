"use strict";

import { createMigration } from "../helpers/createMigration.js";
var { setup, up, down } = createMigration([
  "policy/20200212223138_create_idx_trip_id",
], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
