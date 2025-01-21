import { path } from "@/deps.ts";

const { join, extname, basename, parse } = path;

export { basename, extname, join, parse };

export function basePath(): string {
  return join(import.meta.url, "..", "..", "..");
}
