import { JsonOptions } from "../../interfaces/index.ts";

export async function* streamJson<T>(
  filepath: string,
  sheetOptions: JsonOptions,
  chunkSize = 100,
): AsyncIterable<T[]> {
  // Lire tout le fichier comme une seule chaîne
  const file = await Deno.readTextFile(filepath);
  try {
    // Parse tout le fichier
    const parsed = JSON.parse(file);
    // Si un filtre est défini, extraire le sous-ensemble correspondant
    const data = sheetOptions.filter ? parsed[sheetOptions.filter] : parsed;
    // Vérifiez si c'est un tableau JSON
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
      console.error("Le fichier JSON n'est pas un tableau !");
      throw new Error("Le fichier JSON doit être un tableau.");
    }
    return;
  } catch (error) {
    console.error("Erreur lors du parsing du fichier JSON :", error);
    throw error;
  }
}
