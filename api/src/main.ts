import { args } from "@/lib/cli/index.ts";
import { logger } from "@/lib/logger/index.ts";
import { exit } from "@/lib/process/index.ts";
import "dep:reflect-metadata";
import { bootstrap as app } from "./pdc/proxy/bootstrap.ts";

async function run() {
  const [command, ...opts] = args();
  try {
    await app.boot(command, ...opts);
  } catch (e) {
    logger.error(e.message, e);
    exit(1);
  }
}

run();
