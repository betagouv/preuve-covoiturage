#!/usr/bin/env node

import { boot } from './bootstrap';
console.log('Bootstraping app...');

boot(process.argv)
  .then(() => {
    console.log('Ready!');
  })
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
