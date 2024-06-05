import { createReadStream } from 'node:fs';
import type { JsonOptions } from '../../interfaces/index.ts';
import Filter from 'stream-json/filters/Filter.js';
import StreamArray from 'stream-json/streamers/StreamArray.js';

export async function* streamJson<T>(filepath: string, sheetOptions: JsonOptions, chunkSize = 100): AsyncIterable<T[]> {
  const pipe = createReadStream(filepath, { encoding: 'utf-8' }).pipe(Filter.withParser(sheetOptions)).pipe(StreamArray.streamArray());

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
