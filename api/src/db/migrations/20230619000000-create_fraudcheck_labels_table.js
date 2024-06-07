"use strict";

import { createMigration } from "../helpers/createMigration.js";
var { setup, up, down } = createMigration([
  "fraudcheck/20230601000000_create_labels",
], __dirname);
exports.setup = setup;
exports.up = up;
exports.down = down;
