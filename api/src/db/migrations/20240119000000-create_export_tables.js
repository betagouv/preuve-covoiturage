"use strict";

import { createMigration } from "../helpers/createMigration.js";
var { setup, up, down } = createMigration([
  "export/20240119000000_create_export_tables",
], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
