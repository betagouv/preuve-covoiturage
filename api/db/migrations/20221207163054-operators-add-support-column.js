'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration([
  'operator/20221207163054-operators-add-support-column',
], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
