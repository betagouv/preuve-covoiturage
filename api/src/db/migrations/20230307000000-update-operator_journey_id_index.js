"use strict";

import { createMigration } from "../helpers/createMigration.js";
var { setup, up, down } = createMigration([
  "carpool/20230307000000_update_operator_journey_id_index",
], __dirname);
exports.setup = setup;
exports.up = up;
exports.down = down;
