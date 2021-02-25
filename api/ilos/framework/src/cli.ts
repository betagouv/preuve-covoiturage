#!/usr/bin/env node

import { Bootstrap } from './Bootstrap';
console.info('Bootstraping app...');

Bootstrap.createFromPath().then((app) => {
  const [, , command, ...opts] = process.argv;
  app
    .boot(command, ...opts)
    .then(() => {
      console.info('[ilos] framework ready');
    })
    .catch((e) => {
      console.error(e.message, e);
      process.exit(1);
    });
});
