"use strict";

import { createMigration } from "../helpers/createMigration.js";
var { setup, up, down } = createMigration([
  "trip/20191125100001_create_export_view",
], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
