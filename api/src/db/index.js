const DBMigrate = require('db-migrate');
const GeoMigrator = require('../etl/index.js');

const instances = new Map();

async function createInstance(config) {
  const silent = !('APP_MIGRATOR_VERBOSE' in process.env);
  const instance = DBMigrate.getInstance(true, {
        config: { dev: config },
        cwd: __dirname,
        throwUncatched: true,
    });
    instance.silence(silent);
    await instance.registerAPIHook();
    return instance;
}

function getInstance(config) {
  return instances.get(JSON.stringify(config));
}

function setInstance(config, instance) {
  instances.set(JSON.stringify(config), instance);
  return instance;
}

async function migrate(config, skipDatasets = true, ...args) {
    if(!('SKIP_GEO_MIGRATIONS' in process.env)) {
      const geoInstance = GeoMigrator.buildMigrator({
        pool: config,
        ...(
          skipDatasets ? {
            app: {
              targetSchema: 'geo',
              datasets: [],
            },
          } : {}
        ),
      });
      await geoInstance.prepare();
      await geoInstance.run();
      await geoInstance.pool.end();
    }
    if(!('SKIP_SQL_MIGRATIONS' in process.env)) {
      const instance = getInstance(config) ?? setInstance(config, await createInstance(config));
      await instance.up(...args);
    }
}

async function createDatabase(config, name) {
    const instance = getInstance(config) ?? setInstance(config, await createInstance(config));
    return instance.createDatabase(name);
}

async function dropDatabase(config, name) {
    const instance = getInstance(config) ?? setInstance(config, await createInstance(config));
    return instance.dropDatabase(name);
}

module.exports = { migrate, createDatabase, dropDatabase };
