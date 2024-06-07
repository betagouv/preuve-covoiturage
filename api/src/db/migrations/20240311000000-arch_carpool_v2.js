"use strict";

import { createMigration } from "../helpers/createMigration.js";
var { setup, up, down } = createMigration(
  [
    "arch_carpool/20240311000000-update_carpool_v2",
  ],
  __dirname,
);

exports.setup = setup;
exports.up = up;
exports.down = down;
