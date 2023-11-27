'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration(['carppool/20231127000000_drop_carpool_incentives_fk_constraint'], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;