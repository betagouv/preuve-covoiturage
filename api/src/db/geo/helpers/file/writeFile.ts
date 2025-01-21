export function writeFile(filepath: string, stream: ReadableStream): Promise<void> {
  return Deno.writeFile(filepath, stream);
}
