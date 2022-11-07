'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration([
  'policy/20221107000000-policy_add_pmgf_occitanie',
], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
