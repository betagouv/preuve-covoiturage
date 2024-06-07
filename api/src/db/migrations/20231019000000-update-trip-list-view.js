"use strict";

import { createMigration } from "../helpers/createMigration.js";
var { setup, up, down } = createMigration([
  "trip/20231019000000_update_trip_list_view",
], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
