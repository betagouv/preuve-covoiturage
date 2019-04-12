const { mongoUrl, mongoDatabase } = require('@pdc/shared/config');

const config = {
  mongodb: {
    url: mongoUrl,
    databaseName: mongoDatabase,

    options: {
      useNewUrlParser: true,
      //   connectTimeoutMS: 3600000, // increase connection timeout to 1 hour
      //   socketTimeoutMS: 3600000, // increase socket timeout to 1 hour
    },
  },

  // The migrations dir, can be an relative or absolute path.
  // Only edit this when really necessary.
  migrationsDir: 'src/database/migrations',

  // The mongodb collection where the applied changes are stored.
  // Only edit this when really necessary.
  changelogCollectionName: 'migrations',
};

// Return the config as a promise
module.exports = config;
