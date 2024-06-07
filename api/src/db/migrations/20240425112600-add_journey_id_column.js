"use strict";

/* eslint-disable-next-line */
import { createMigration } from "../helpers/createMigration.js";
var { setup, up, down } = createMigration([
  "cee/20240425112600-add_journey_id_column",
], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
