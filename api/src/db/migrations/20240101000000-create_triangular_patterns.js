"use strict";

import { createMigration } from "../helpers/createMigration.js";
var { setup, up, down } = createMigration([
  "fraudcheck/20240101000000_create_triangular_patterns",
], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
