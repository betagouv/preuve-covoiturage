import fs from 'fs/promises';

export async function loadFileAsString(path: string): Promise<string> {
  console.debug(`Loading file ${path}`);
  return fs.readFile(path, { encoding: 'utf-8' });
}
