"use strict";

import { createMigration } from "../helpers/createMigration.js";
var { setup, up, down } = createMigration([
  "cee/20221220000000-add_application_ts",
], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
