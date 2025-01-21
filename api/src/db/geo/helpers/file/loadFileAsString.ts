import { readFile } from "@/deps.ts";
import { logger } from "@/lib/logger/index.ts";

export async function loadFileAsString(path: string): Promise<string> {
  logger.debug(`Loading file ${path}`);
  return readFile(path, { encoding: "utf-8" });
}
