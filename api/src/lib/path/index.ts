import { basename, extname, join, parse } from "dep:path";

export { basename, extname, join, parse };

export function basePath(): string {
  return join(import.meta.url, "..", "..", "..");
}
