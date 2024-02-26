'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration([
  'carpool/20221207000000_add_payment',
], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
