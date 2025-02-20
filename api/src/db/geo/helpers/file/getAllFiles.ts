import { extname, join } from "@/lib/path/index.ts";
import { readdir, stat } from "dep:fs-promises";

export async function getAllFiles(
  baseDirectory: string,
  extensions: string[],
  setOfFiles: Set<string>,
): Promise<Set<string>> {
  const files = await readdir(baseDirectory);
  for await (const file of files) {
    const filepath = join(baseDirectory, file);
    const filestat = await stat(filepath);
    if (filestat.isDirectory()) {
      await getAllFiles(filepath, extensions, setOfFiles);
    } else if (extensions.indexOf(extname(filepath)) >= 0) {
      setOfFiles.add(filepath);
    }
  }
  return setOfFiles;
}
