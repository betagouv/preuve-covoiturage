import { provider, ServiceContainerInterfaceResolver } from '@ilos/common';

import { FraudCheckRepositoryProviderInterfaceResolver } from '../interfaces/FraudCheckRepositoryProviderInterface';
import { checkList } from './checks';
import { StaticCheckInterface, CheckInterface } from '../interfaces/CheckInterface';
import { FraudCheckResult } from '../interfaces';

@provider()
export class CheckEngine {
  public readonly checks: StaticCheckInterface[] = [...checkList];

  constructor(
    private repository: FraudCheckRepositoryProviderInterfaceResolver,
    private service: ServiceContainerInterfaceResolver,
  ) {}

  /**
   *  Get a processor from a method string
   *  cast from IOC and initialize if needed
   */
  protected async getCheckProcessor(method: string): Promise<CheckInterface> {
    const processorCtor = this.checks.find((c) => c.key === method);
    if (!processorCtor) {
      throw new Error(`Unknown check ${method}`);
    }

    const processor = this.service.get(processorCtor);
    if ('init' in processor) {
      await processor.init();
    }

    return processor;
  }

  /**
   *  List all available fraud check methods
   */
  listAvailableMethods(): string[] {
    return this.checks.map((c) => c.key);
  }

  /**
   *  Apply a method on an acquisition_id
   *  - get the check processor
   *  - get the check meta
   *  - if status != done, proccess it
   *  - save result metadata
   */
  async applyOne(acquisitionId: number, method: string): Promise<FraudCheckResult> {
    const processor = await this.getCheckProcessor(method);
    const checkMeta = await this.repository.findOrCreateFraudCheck(acquisitionId, method);

    if (checkMeta.status === 'done') {
      return;
    }

    try {
      const { meta, karma } = await processor.handle(acquisitionId, checkMeta.meta);
      await this.repository.updateFraudCheck({
        ...checkMeta,
        meta,
        karma,
        status: 'done',
      });
    } catch (e) {
      await this.repository.updateFraudCheck({
        ...checkMeta,
        status: 'error',
        meta: {
          error: e.message,
        },
      });
      throw e;
    }
  }

  async apply(acquisitionId: number, methods: string[]): Promise<void> {
    for (const method of methods) {
      await this.applyOne(acquisitionId, method);
    }
    return;
  }

  async getGlobalScore(acquisitionId: number): Promise<number> {
    return this.repository.getScore(acquisitionId);
  }
}
