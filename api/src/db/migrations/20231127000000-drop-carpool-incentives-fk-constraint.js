"use strict";

import { createMigration } from "../helpers/createMigration.js";
var { setup, up, down } = createMigration([
  "carpool/20231127000000_drop_carpool_incentives_fk_constraint",
], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
