import extract from 'extract-zip';

export function unzipFile(filepath: string, extractPath: string): Promise<void> {
  return extract(filepath, { dir: extractPath });
}
