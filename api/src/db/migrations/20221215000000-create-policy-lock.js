"use strict";

import { createMigration } from "../helpers/createMigration.js";
var { setup, up, down } = createMigration([
  "policy/20221215000000_create_policy_lock_table",
], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
