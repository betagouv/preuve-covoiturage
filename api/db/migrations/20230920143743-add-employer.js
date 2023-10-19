'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration(['honor/20230920143743795-add-employer'], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;