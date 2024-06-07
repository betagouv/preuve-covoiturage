"use strict";

import { createMigration } from "../helpers/createMigration.js";
var { setup, up, down } = createMigration(
  [
    "observatory/000_create_observatory_schema",
    "observatory/001_create_monthly_flux_table",
    "observatory/002_create_monthly_occupation_table",
    "observatory/003_insert_monthly_flux_procedure",
    "observatory/004_insert_monthly_occupation_procedure",
    "observatory/005_create_monthly_distribution_table",
    "observatory/006_insert_monthly_distribution_procedure",
  ],
  __dirname,
);

exports.setup = setup;
exports.up = up;
exports.down = down;
