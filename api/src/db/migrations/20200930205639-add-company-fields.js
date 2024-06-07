"use strict";

import { createMigration } from "../helpers/createMigration.js";
var { setup, up, down } = createMigration(
  ["company/20200930205639_add_fields"],
  __dirname,
);

exports.setup = setup;
exports.up = up;
exports.down = down;
