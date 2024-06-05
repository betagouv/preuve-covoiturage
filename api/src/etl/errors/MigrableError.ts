import { DatasetInterface, StaticAbstractDataset } from '../interfaces/index.ts';

export class MigrableError extends Error {
  constructor(migrable: DatasetInterface, message: string) {
    super(`[${(migrable.constructor as StaticAbstractDataset).uuid}] ${message}`);
  }
}
