export function getTmpDir(): string {
  return Deno.makeTempDirSync();
}
