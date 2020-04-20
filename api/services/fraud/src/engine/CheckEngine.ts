import { provider, ServiceContainerInterfaceResolver, NewableType } from '@ilos/common';

import { FraudCheckRepositoryProviderInterfaceResolver } from '../interfaces/FraudCheckRepositoryProviderInterface';
import { checkList } from './checks/self';
import {
  StaticCheckInterface,
  CheckInterface,
  HandleCheckInterface,
  PrepareCheckInterface,
} from '../interfaces/CheckInterface';
import { FraudCheck, FraudCheckStatusEnum } from '../interfaces';

@provider()
export class CheckEngine {
  public readonly checks: StaticCheckInterface[] = [...checkList];

  constructor(
    private repository: FraudCheckRepositoryProviderInterfaceResolver,
    private service: ServiceContainerInterfaceResolver,
  ) {}

  /**
   *  Get a processor ctor from a method string
   */
  protected getCheckProcessor(method: string): NewableType<CheckInterface | HandleCheckInterface> {
    const processorCtor = this.checks.find((c) => c.key === method);
    if (!processorCtor) {
      throw new Error(`Unknown check ${method}`);
    }
    return processorCtor;
  }

  /**
   *  List all available fraud check methods
   */
  listAvailableMethods(): string[] {
    return this.checks.map((c) => c.key);
  }

  async apply(
    acquisitionId: number,
    methods: Map<string, HandleCheckInterface>,
    preparerCtor: NewableType<PrepareCheckInterface>,
  ): Promise<FraudCheck[]> {
    const result: FraudCheck[] = [];
    const preparer = this.service.get<PrepareCheckInterface>(preparerCtor);
    const data = await preparer.prepare(acquisitionId);
    for (const line of data) {
      for (const [name, instance] of methods) {
        try {
          result.push({
            status: FraudCheckStatusEnum.Done,
            acquisition_id: acquisitionId,
            method: name,
            karma: Math.round(await instance.handle(line)),
          });
        } catch (e) {
          result.push({
            status: FraudCheckStatusEnum.Error,
            acquisition_id: acquisitionId,
            method: name,
            karma: null,
            error: e.message,
          });
          throw e;
        }
      }
    }
    return result;
  }
  protected hasExternalPreparer(check: HandleCheckInterface | CheckInterface): check is HandleCheckInterface {
    return (check as HandleCheckInterface).preparer !== undefined;
  }

  async run(acquisitionId: number, methods: string[]): Promise<void> {
    const methodInstancesMap = methods
      .map((s) => {
        return [s, this.getCheckProcessor(s)];
      })
      .reduce((methodMap, item: [string, NewableType<CheckInterface | HandleCheckInterface>]) => {
        const [name, instanceCtor] = item;
        const instance = this.service.get<HandleCheckInterface>(instanceCtor);
        const preparer = this.hasExternalPreparer(instance)
          ? instance.preparer
          : (instanceCtor as NewableType<PrepareCheckInterface>);

        if (!methodMap.has(preparer)) {
          methodMap.set(preparer, new Map());
        }

        const checks = methodMap.get(preparer);
        checks.set(name, instance);
        methodMap.set(preparer, checks);

        return methodMap;
      }, new Map<NewableType<PrepareCheckInterface>, Map<string, HandleCheckInterface>>());

    const results: FraudCheck[] = [];

    for (const [preparer, checks] of methodInstancesMap) {
      results.push(...(await this.apply(acquisitionId, checks, preparer)));
    }

    await this.repository.createOrUpdateMany(results);
    return;
  }

  async getGlobalScore(acquisitionId: number): Promise<number> {
    return this.repository.getScore(acquisitionId);
  }
}
