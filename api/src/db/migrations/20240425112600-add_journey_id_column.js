'use strict';

/* eslint-disable-next-line */
var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration(['cee/20240425112600-add_journey_id_column'], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
