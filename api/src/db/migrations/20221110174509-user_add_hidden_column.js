"use strict";

import { createMigration } from "../helpers/createMigration.js";
var { setup, up, down } = createMigration([
  "auth/20221110174509-user_add_hidden_column",
], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
