let tmpDir: string;
export function getTmpDir(): string {
  if (!tmpDir) {
    tmpDir = Deno.makeTempDirSync();
  }
  return tmpDir;
}
