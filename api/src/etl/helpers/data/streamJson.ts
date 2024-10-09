import { createReadStream } from "@/deps.ts";
import type { JsonOptions } from "../../interfaces/index.ts";
const { default: Pick } = await import("npm:stream-json@^1.8/filters/Pick.js");
const { default: StreamArray } = await import(
  "npm:stream-json@^1.8/streamers/StreamArray.js"
);

export async function* streamJson<T>(
  filepath: string,
  sheetOptions: JsonOptions,
  chunkSize = 100,
): AsyncIterable<T[]> {
  const pipe = createReadStream(filepath, { encoding: "utf-8" }).pipe(
    Pick.withParser(sheetOptions),
  ).pipe(new StreamArray());

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
