"use strict";

import { createMigration } from "../helpers/createMigration.js";
var { setup, up, down } = createMigration([
  "territory/002_create_territory_operator_table",
], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
