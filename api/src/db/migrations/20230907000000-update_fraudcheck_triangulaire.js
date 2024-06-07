"use strict";

import { createMigration } from "../helpers/createMigration.js";
var { setup, up, down } = createMigration([
  "fraudcheck/20230907000000_update_triangulaire",
], __dirname);
exports.setup = setup;
exports.up = up;
exports.down = down;
