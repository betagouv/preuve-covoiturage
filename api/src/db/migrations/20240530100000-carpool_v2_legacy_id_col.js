'use strict';

/* eslint-disable-next-line */
var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration(['carpool/20240530100000-carpool_v2_legacy_id_col'], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
