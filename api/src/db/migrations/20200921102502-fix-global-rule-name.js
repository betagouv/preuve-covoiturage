"use strict";

import { createMigration } from "../helpers/createMigration.js";
var { setup, up, down } = createMigration([
  "policy/20200921102502_fix_global_rule_name",
], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
