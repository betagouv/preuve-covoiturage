import { createWriteStream, Readable } from "@/deps.ts";

export function writeFile(stream: Readable, filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(filepath);
    stream.pipe(file);
    stream.on("error", reject);
    file.on("finish", resolve);
    file.on("error", reject);
  });
}
