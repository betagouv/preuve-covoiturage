"use strict";

import { createMigration } from "../helpers/createMigration.js";
var { setup, up, down } = createMigration(
  ["company/000_create_company_schema", "company/001_create_company_table"],
  __dirname,
);

exports.setup = setup;
exports.up = up;
exports.down = down;
