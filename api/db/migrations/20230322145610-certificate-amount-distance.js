'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration([
  'certificate/20230322145610_certificate_amount_distance',
], __dirname);
exports.setup = setup;
exports.up = up;
exports.down = down;