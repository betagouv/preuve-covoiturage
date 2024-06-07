"use strict";

import { createMigration } from "../helpers/createMigration.js";
var { setup, up, down } = createMigration([
  "policy/20230206000000-update_policy_table",
], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
