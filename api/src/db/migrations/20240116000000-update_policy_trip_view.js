"use strict";

import { createMigration } from "../helpers/createMigration.js";
var { setup, up, down } = createMigration(
  [
    "policy/20240116000000_update_policy_trip_view",
  ],
  __dirname,
);

exports.setup = setup;
exports.up = up;
exports.down = down;
