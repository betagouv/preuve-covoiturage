#!/usr/bin/env node

import { process } from "@/deps.ts";
import { exit } from "@/lib/process/index.ts";
import { Bootstrap } from "./Bootstrap.ts";

Bootstrap.createFromPath().then((app) => {
  const [, , command, ...opts] = process.argv;
  app.boot(command, ...opts).catch((e) => {
    console.error(e.message, e);
    exit(1);
  });
});
