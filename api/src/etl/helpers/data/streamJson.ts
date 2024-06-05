import { createReadStream } from 'node:fs';
import type { JsonOptions } from '../../interfaces/index.ts';
import { withParser } from 'stream-json/filters/Pick.ts';
import { streamArray } from 'stream-json/streamers/StreamArray.ts';

export async function* streamJson<T>(filepath: string, sheetOptions: JsonOptions, chunkSize = 100): AsyncIterable<T[]> {
  const pipe = createReadStream(filepath, { encoding: 'utf-8' }).pipe(withParser(sheetOptions)).pipe(streamArray());

  let chunk: T[] = [];
  for await (const line of pipe) {
    if (chunk.length === chunkSize) {
      yield chunk;
      chunk = [];
    }
    chunk.push(line);
  }
  yield chunk;

  return;
}
