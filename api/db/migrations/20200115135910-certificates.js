'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration(
  [
    'certificate/20200115135819_create_certificate_schema',
    'certificate/20200115135834_create_certificate_certificates_table',
    'certificate/20200115135850_create_certificate_accesslog_table',
    'certificate/20200115151115_create_certificate_identities_view',
  ],
  __dirname,
);

exports.setup = setup;
exports.up = up;
exports.down = down;
