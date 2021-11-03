'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration(['trip/20211005110112-fix_hydrate_from_policy'], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
