'use strict';
const exec = require('util').promisify(require('child_process').exec);
const path = require('path');
const process = require('process');

/**
 * Cast all foreign keys *_id as integer to match PostgreSQL types
 * Current type is 'varchar' as fkeys were migrated from MongoDB
 * as a toString() of ObjectID objects.
 */
var { createMigration } = require('../helpers/createMigration');

var { setup, up, down } = createMigration(
  ['territory/20200606000004_clean_territory_names'],
  __dirname,
  async (up = true) => {
    if (up) {
      console.log('call sync:region_dep');
      try {
        const { stdout, stderr } = await exec(
          `yarn workspace @pdc/proxy ilos sync:region_dep -u ${process.env.DATABASE_URL}`,
          {
            cwd: path.resolve(path.resolve(__dirname, '..', '..')),
          },
        );
        console.log({ stdout, stderr });
        if (stderr) {
          throw new Error(stderr);
        }
      } catch (e) {
        console.log(e);
        throw e;
      }
    }
  },
);

exports.setup = setup;
exports.up = up;
exports.down = down;
