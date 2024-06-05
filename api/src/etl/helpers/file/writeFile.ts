import { Readable } from 'node:stream';
import fs from 'node:fs';

export function writeFile(stream: Readable, filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    stream.pipe(file);
    stream.on('error', reject);
    file.on('finish', resolve);
    file.on('error', reject);
  });
}