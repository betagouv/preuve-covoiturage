import {
  FileManagerConfigInterface,
  FileManagerInterface,
} from "../interfaces/index.ts";
import { config } from "../config.ts";
import { FileManager } from "../providers/index.ts";

export function createFileManager(
  fileConfig: FileManagerConfigInterface = config.file,
): FileManagerInterface {
  return new FileManager(fileConfig);
}
