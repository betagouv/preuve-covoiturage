"use strict";

import { createMigration } from "../helpers/createMigration.js";
var { setup, up, down } = createMigration([
  "application/20191217164651_create_unique_idx",
], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
