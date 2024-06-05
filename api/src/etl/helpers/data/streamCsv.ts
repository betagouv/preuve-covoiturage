import { CsvOptions } from '../../interfaces/index.ts';
import { createReadStream } from 'node:fs';
import { parse } from 'csv-parse';

export async function* streamCsv<T>(filepath: string, sheetOptions: CsvOptions, chunkSize = 100): AsyncIterable<T[]> {
  const fsStream = createReadStream(filepath, { encoding: 'utf-8' });
  const parser = parse({
    columns: (header) => Object.keys(header).map((k) => k.toLowerCase()),
    ...sheetOptions,
  });
  fsStream.pipe(parser);
  let chunk: T[] = [];
  for await (const line of parser) {
    if (chunk.length === chunkSize) {
      yield chunk;
      chunk = [];
    }
    chunk.push(line);
  }
  yield chunk;
  return;
}
