// import { createReadStream, jsonPickUrl, jsonStreamArrayUrl } from "@/deps.ts";
// import type { JsonOptions } from "../../interfaces/index.ts";
// const { default: Pick } = await import(jsonPickUrl);
// const { default: StreamArray } = await import(jsonStreamArrayUrl);

// export async function* streamJson<T>(
//   filepath: string,
//   sheetOptions: JsonOptions,
//   chunkSize = 100,
// ): AsyncIterable<T[]> {
//   const pipe = createReadStream(filepath, { encoding: "utf-8" }).pipe(
//     Pick.withParser(sheetOptions),
//   ).pipe(new StreamArray());

//   let chunk: T[] = [];
//   for await (const line of pipe) {
//     if (chunk.length === chunkSize) {
//       yield chunk;
//       chunk = [];
//     }
//     chunk.push(line);
//   }
//   yield chunk;

//   return;
// }

// TODO FIXME
export async function* streamJson<T>(f: string, s: any, c = 100) {}
