"use strict";

import { createMigration } from "../helpers/createMigration.js";
var { setup, up, down } = createMigration([
  "cee/20230320000000-add_identity_key",
], __dirname);
exports.setup = setup;
exports.up = up;
exports.down = down;
