import { envs_or_default } from "@/lib/env/index.ts";

/**
 * Create a new temporary directory if it doesn't exist yet.
 * Otherwise, return the existing one from the tmpDir variable.
 */
export function getTmpDir(): string {
  return envs_or_default(
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
export function open(
  filepath: string,
  options: OpenFileOptions = { read: true },
): Promise<OpenFileDescriptor> {
  return Deno.open(filepath, {
    ...options,
    create: true,
  });
}
