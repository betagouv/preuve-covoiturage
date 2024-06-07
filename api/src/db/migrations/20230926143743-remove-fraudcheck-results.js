"use strict";

import { createMigration } from "../helpers/createMigration.js";
var { setup, up, down } = createMigration([
  "fraudcheck/20230926000000_remove_fraudcheck_result",
], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
