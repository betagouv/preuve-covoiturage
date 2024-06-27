import { process } from "@/deps.ts";
import { exit } from "@/lib/process/index.ts";
import { bootstrap as app } from "./pdc/proxy/bootstrap.ts";

async function run() {
  const [, , command, ...opts] = process.argv;
  try {
    await app.boot(command, ...opts);
  } catch (e) {
    console.error(e.message, e);
    exit(1);
  }
}

run();
