#!/usr/bin/env node

import { args } from "@/lib/cli/index.ts";
import { exit } from "@/lib/process/index.ts";
import { Bootstrap } from "./Bootstrap.ts";

Bootstrap.createFromPath().then((app) => {
  const [, , command, ...opts] = args();
  app.boot(command, ...opts).catch((e) => {
    console.error(e.message, e);
    exit(1);
  });
});
