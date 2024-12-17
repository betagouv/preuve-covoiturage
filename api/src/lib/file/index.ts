import { env_or_default } from "@/lib/env/index.ts";

/**
 * Create a new temporary directory if it doesn't exist yet.
 * Otherwise, return the existing one from the tmpDir variable.
 */
export function getTmpDir(): string {
  return env_or_default(
    [
      "TMPDIR",
      "TMP",
      "TEMP",
    ],
    "/tmp",
  );
}

export type OpenFileOptions = Deno.OpenOptions;
export type OpenFileDescriptor = Deno.FsFile;

/**
 * Create and open a file for reading and writing.
 *
 * @example
 * const fd = await open("example.txt", { read: true, write: true });
 * fd.close();
 *
 * @example
 * const df = await open("example.txt", { write: true, append: true });
 * await fd.write(new TextEncoder().encode("Hello, World!"));
 * await fd.write(new TextEncoder().encode("Hello, World!"));
 * fd.close();
 *
 * @param filepath
 * @param options
 * @returns
 */
export async function open(filepath: string, options: OpenFileOptions = { read: true }): Promise<OpenFileDescriptor> {
  return Deno.open(filepath, {
    ...options,
    create: true,
  });
}

export async function read(filepath: string): Promise<Deno.FsFile> {
  if (!await exists(filepath)) {
    throw new Error(`File not found: ${filepath}`);
  }

  return Deno.open(filepath, { read: true });
}

export function stat(filepath: string): Promise<Deno.FileInfo> {
  return Deno.stat(filepath);
}

export async function exists(filepath: string): Promise<boolean> {
  try {
    await stat(filepath);
    return true;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return false;
    }
    throw error;
  }
}

export async function readFile(filepath: string) {
  return Deno.readFile(filepath);
}

export function writeSync(filepath: string, data: string, options?: Deno.WriteFileOptions): void {
  return Deno.writeTextFileSync(filepath, data, options);
}

export async function remove(filepath: string): Promise<void> {
  try {
    await Deno.remove(filepath);
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) {
      throw new Error(`Failed to remove file ${filepath}: ${error.message}`);
    }
    // File doesn't exist, which is fine for a remove operation
  }
}
