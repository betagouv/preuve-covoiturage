"use strict";

import { createMigration } from "../helpers/createMigration.js";
var { setup, up, down } = createMigration([
  "cee/20230522000000-update_identity_key",
], __dirname);
exports.setup = setup;
exports.up = up;
exports.down = down;
