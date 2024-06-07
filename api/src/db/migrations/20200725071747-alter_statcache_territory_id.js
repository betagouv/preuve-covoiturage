"use strict";

import { createMigration } from "../helpers/createMigration.js";
var { setup, up, down } = createMigration([
  "trip/20200725071747-alter_statcache_territory_id",
], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
