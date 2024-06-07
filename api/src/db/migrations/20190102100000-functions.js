"use strict";

import { createMigration } from "../helpers/createMigration.js";
var { setup, up, down } = createMigration([
  "common/100_create_function_touch_updated_at",
], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
