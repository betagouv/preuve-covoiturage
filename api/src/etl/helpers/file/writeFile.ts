export function writeFile(
  stream: ReadableStream,
  filepath: string,
): Promise<void> {
  return Deno.writeFile(filepath, stream);
}
