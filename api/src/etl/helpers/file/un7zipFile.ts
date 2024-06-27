import { extractFull, SevenZipOptions } from "@/deps.ts";
import { config } from "../../config.ts";

export function un7zFile(filepath: string, extractPath: string): Promise<void> {
  let sevenZipOptions: SevenZipOptions;

  if (config.app.sevenZipBinPath) {
    sevenZipOptions = { $bin: config.app.sevenZipBinPath };
  }

  return new Promise((resolve, reject) => {
    const stream = extractFull(filepath, extractPath, sevenZipOptions);
    stream.on("end", resolve);
    stream.on("error", reject);
  });
}
