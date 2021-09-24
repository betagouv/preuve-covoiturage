'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration(['trip/20210922154422-update_trip_view_indexes'], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
