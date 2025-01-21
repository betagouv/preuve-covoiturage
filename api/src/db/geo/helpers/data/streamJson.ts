import { JsonOptions } from "../../interfaces/index.ts";

export async function* streamJson<T>(
  filepath: string,
  sheetOptions: JsonOptions,
  chunkSize = 100,
): AsyncIterable<T[]> {
  const file = await Deno.readTextFile(filepath);

  const parsed = JSON.parse(file);
  const data = sheetOptions.filter ? parsed[sheetOptions.filter] : parsed;

  if (Array.isArray(data)) {
    let chunk: T[] = [];
    for (const line of data) {
      chunk.push(line);

      if (chunk.length === chunkSize) {
        yield chunk;
        chunk = [];
      }
    }
    // Renvoyer le dernier chunk s'il reste des éléments
    if (chunk.length > 0) {
      yield chunk;
    }
  } else {
    throw new Error("Le fichier JSON doit être un tableau.");
  }
}
