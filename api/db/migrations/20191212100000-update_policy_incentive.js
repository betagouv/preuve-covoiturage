'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration(['policy/20191212100000_update_policy_incentive_table'], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
