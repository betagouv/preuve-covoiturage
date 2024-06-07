"use strict";

import { createMigration } from "../helpers/createMigration.js";
var { setup, up, down } = createMigration([
  "carpool/20191122100001_update_carpool_table",
], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
