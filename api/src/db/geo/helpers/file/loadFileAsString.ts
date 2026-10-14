import { taggedLogger } from "@/lib/logger/tagged.ts";
import { readFile } from "dep:fs-promises";

const log = taggedLogger("[geo-import]", { maxLength: 512 });

export async function loadFileAsString(path: string): Promise<string> {
  log.debug("loading file", { file: path });
  return readFile(path, { encoding: "utf-8" });
}
