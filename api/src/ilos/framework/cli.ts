#!/usr/bin/env node

import { Bootstrap } from "./Bootstrap.ts";

Bootstrap.createFromPath().then((app) => {
  const [, , command, ...opts] = process.argv;
  app.boot(command, ...opts).catch((e) => {
    console.error(e.message, e);
    process.exit(1);
  });
});
