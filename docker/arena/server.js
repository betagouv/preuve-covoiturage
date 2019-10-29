const Arena = require('bull-arena');

const express = require('express');
const app = express();

/**
 * Configure the Redis queues below
 * - 'url' and 'hostId' are required
 * - matche the name with the declared queue names in the application
 */
const arena = Arena({
  queues: [
    {
      name: 'trip',
      hostId: 'redis',
      url: process.env.APP_REDIS_URL,
    },
    {
      name: 'normalization',
      hostId: 'redis',
      url: process.env.APP_REDIS_URL,
    },
  ],
});

app.use('/', arena);
app.listen();
