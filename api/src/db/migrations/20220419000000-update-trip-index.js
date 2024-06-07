"use strict";

import { createMigration } from "../helpers/createMigration.js";
var { setup, up, down } = createMigration([
  "trip/20220629000000_update_trip_indexes",
], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
