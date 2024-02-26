'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration(['policy/20200921102502_fix_global_rule_name'], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
