"use strict";

import { createMigration } from "../helpers/createMigration.js";
var { setup, up, down } = createMigration([
  "acquisition/20220905000000-add_api_version",
], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
