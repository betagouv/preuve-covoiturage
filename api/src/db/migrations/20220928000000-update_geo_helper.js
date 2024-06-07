"use strict";

import { createMigration } from "../helpers/createMigration.js";
var { setup, up, down } = createMigration([
  "geo/20220928000000_update_geo_helper",
], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
