"use strict";

import { createMigration } from "../helpers/createMigration.js";
var { setup, up, down } = createMigration([
  "trip/20210922135412-update_trip_view_operator_ids_fix",
], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
