import extractZip from "dep:extract-zip";

export function unzipFile(
  filepath: string,
  extractPath: string,
): Promise<void> {
  return extractZip(filepath, { dir: extractPath });
}
