import { ProcessableCarpool } from './ProcessableCarpool';

export interface ProcessableCarpoolRepositoryProviderInterface {
  refresh(): Promise<void>;
  findProcessable(batchSize?: number): AsyncGenerator<ProcessableCarpool[], void, void>;
}

export abstract class ProcessableCarpoolRepositoryProviderInterfaceResolver
  implements ProcessableCarpoolRepositoryProviderInterface {
  abstract refresh(): Promise<void>;
  abstract findProcessable(batchSize?: number): AsyncGenerator<ProcessableCarpool[], void, void>;
}
