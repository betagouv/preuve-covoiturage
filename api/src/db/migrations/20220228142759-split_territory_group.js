"use strict";

import { createMigration } from "../helpers/createMigration.js";
var { setup, up, down } = createMigration([
  "territory/20220228142759_split_territory_group",
], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
