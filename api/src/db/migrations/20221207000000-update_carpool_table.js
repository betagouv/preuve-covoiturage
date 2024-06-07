"use strict";

import { createMigration } from "../helpers/createMigration.js";
var { setup, up, down } = createMigration([
  "carpool/20221207000000_add_payment",
], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
