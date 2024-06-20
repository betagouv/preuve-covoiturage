import { extractZip } from "@/deps.ts";

export function unzipFile(
  filepath: string,
  extractPath: string,
): Promise<void> {
  return extractZip(filepath, { dir: extractPath });
}
