'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration([
  'acquisition/20230511000000-add_cancel_prop'
], __dirname);
exports.setup = setup;
exports.up = up;
exports.down = down;
