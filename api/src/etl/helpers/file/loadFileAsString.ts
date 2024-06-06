import { readFile } from "@/deps.ts";

export async function loadFileAsString(path: string): Promise<string> {
  console.debug(`Loading file ${path}`);
  return readFile(path, { encoding: 'utf-8' });
}
