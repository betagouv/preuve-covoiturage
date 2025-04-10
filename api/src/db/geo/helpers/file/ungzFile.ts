import { createReadStream, createWriteStream } from "dep:fs";
import { createGunzip } from "dep:zlib";

export function ungzFile(filepath: string, extractPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const fileContents = createReadStream(filepath);
    const writeStream = createWriteStream(extractPath);
    const unzip = createGunzip();
    const file = fileContents.pipe(unzip);
    file.pipe(writeStream);
    file.on("finish", resolve);
    file.on("error", reject);
  });
}
