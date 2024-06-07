"use strict";

import { createMigration } from "../helpers/createMigration.js";
var { setup, up, down } = createMigration([
  "carpool/20230612000000_add_id_key",
], __dirname);
exports.setup = setup;
exports.up = up;
exports.down = down;
