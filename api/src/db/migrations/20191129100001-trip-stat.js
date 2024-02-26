'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration(['trip/20191129100001_create_stat_cache_table'], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
