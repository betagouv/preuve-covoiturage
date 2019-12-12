'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration(['trip/20191212130725_create_idfm_view'], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
