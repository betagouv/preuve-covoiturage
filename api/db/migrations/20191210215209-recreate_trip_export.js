'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration(['trip/20191125100001_create_export_view'], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
