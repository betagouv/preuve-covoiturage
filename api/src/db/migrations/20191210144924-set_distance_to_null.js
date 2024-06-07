"use strict";

import { createMigration } from "../helpers/createMigration.js";
var { setup, up, down } = createMigration(
  [
    "acquisition/20191210144924_set_distance_to_null",
    "carpool/20191210144924_set_distance_to_null",
  ],
  __dirname,
);

exports.setup = setup;
exports.up = up;
exports.down = down;
