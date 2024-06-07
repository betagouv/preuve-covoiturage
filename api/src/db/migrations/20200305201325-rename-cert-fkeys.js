"use strict";
import { createMigration } from "../helpers/createMigration.js";
var { setup, up, down } = createMigration([
  "certificate/20200305201325_rename_id_to_uuid",
], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
