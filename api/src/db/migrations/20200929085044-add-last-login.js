"use strict";

import { createMigration } from "../helpers/createMigration.js";
var { setup, up, down } = createMigration([
  "auth/20200929085044_add_last_login",
], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
