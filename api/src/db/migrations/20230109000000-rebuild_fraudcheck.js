"use strict";

import { createMigration } from "../helpers/createMigration.js";
var { setup, up, down } = createMigration([
  "fraudcheck/20220109000000_rebuild_fraudcheck",
], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
