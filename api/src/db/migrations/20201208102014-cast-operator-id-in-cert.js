"use strict";

import { createMigration } from "../helpers/createMigration.js";
var { setup, up, down } = createMigration([
  "certificate/20201208102014_cast_operator_id",
], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
