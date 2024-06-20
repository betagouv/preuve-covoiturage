import { process } from "@/deps.ts";
import { bootstrap as app } from "./pdc/proxy/bootstrap.ts";

async function run() {
  const [, , command, ...opts] = process.argv;
  try {
    await app.boot(command || "seed", ...opts);
  } catch (e) {
    console.error(e.message, e);
    process.exit(1);
  }
}

run();
