import { createReadStream, StreamJsonFilter as Filter, StreamJsonStreamArray as StreamArray } from '@/deps.ts';
import type { JsonOptions } from '../../interfaces/index.ts';

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
