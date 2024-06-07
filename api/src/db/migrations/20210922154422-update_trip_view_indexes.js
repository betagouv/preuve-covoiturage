"use strict";

import { createMigration } from "../helpers/createMigration.js";
var { setup, up, down } = createMigration([
  "trip/20210922154422-update_trip_view_indexes",
], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
