#!/usr/bin/env node

import { Bootstrap } from './Bootstrap';
console.log('Bootstraping app...');

Bootstrap.createFromPath().then((app) => {
  const [, , command, ...opts] = process.argv;
  app
    .boot(command, ...opts)
    .then(() => {
      console.log('[ilos] framework ready');
    })
    .catch((e) => {
      console.error(e.message);
      process.exit(1);
    });
});
