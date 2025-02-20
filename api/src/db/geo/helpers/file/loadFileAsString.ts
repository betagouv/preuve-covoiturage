import { logger } from "@/lib/logger/index.ts";
import { readFile } from "dep:fs-promises";

export async function loadFileAsString(path: string): Promise<string> {
  logger.debug(`Loading file ${path}`);
  return readFile(path, { encoding: "utf-8" });
}
