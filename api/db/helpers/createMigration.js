'use strict';

const fs = require('fs');
const path = require('path');

exports.createMigration = function(files, basePath = __dirname) {
  let dbm;
  let type;
  let seed;
  let Promise;

  function resolveFile(file, extension = 'sql') {
    const filepath = path.join(basePath, `${file}.${extension}`);
    console.log(filepath);
    if (!fs.existsSync(filepath)) {
      throw new Error(`File not found (${filepath})`);
    }
    return fs.readFileSync(filepath, { encoding: 'utf-8' });
  }

  return {
    setup: function(options, seedLink) {
      dbm = options.dbmigrate;
      type = dbm.dataType;
      seed = seedLink;
      Promise = options.Promise;
    },
    up: function(db) {
      let data = '';
      for (const file of files) {
        data += `${resolveFile(file, 'up.sql')}\n`;
      }
      console.log(data);
      return db.runSql(data);
    },
    down: async function(db) {
      let data = '';
      for (const file of files.reverse()) {
        data += `${resolveFile(file, 'down.sql')}\n`;
      }
      console.log(data);
      return db.runSql(data);
    },
  };
};
