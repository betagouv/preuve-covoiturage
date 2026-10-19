import { args } from "@/lib/cli/index.ts";
import { taggedLogger } from "@/lib/logger/tagged.ts";
const log = taggedLogger("[boot]", { maxLength: 512 });

import { exit } from "@/lib/process/index.ts";
import "dep:reflect-metadata";
import { bootstrap as app } from "./pdc/proxy/bootstrap.ts";

async function run() {
  const [command, ...opts] = args();
  try {
    await app.boot(command, ...opts);
  } catch (e) {
    log.error("boot failed", { error: e instanceof Error ? e.message : String(e) });
    exit(1);
  }
}

run();
