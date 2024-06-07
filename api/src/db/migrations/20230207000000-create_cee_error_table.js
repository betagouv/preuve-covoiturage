"use strict";

import { createMigration } from "../helpers/createMigration.js";
var { setup, up, down } = createMigration([
  "cee/20230207000000-create_cee_error_table",
], __dirname);
exports.setup = setup;
exports.up = up;
exports.down = down;
