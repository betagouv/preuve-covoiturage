import { FileManagerConfigInterface, FileManagerInterface } from '../interfaces/index.js';
import { config } from '../config.js';
import { FileManager } from '../providers/index.js';

export function createFileManager(fileConfig: FileManagerConfigInterface = config.file): FileManagerInterface {
  return new FileManager(fileConfig);
}
