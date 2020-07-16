import { provider, ServiceContainerInterfaceResolver, NewableType } from '@ilos/common';

import { checks as checkList } from './checks';
import {
  StaticCheckInterface,
  CheckInterface,
  HandleCheckInterface,
  PrepareCheckInterface,
} from '../interfaces/CheckInterface';

import { FraudCheck, FraudCheckStatusEnum, FraudCheckEntry } from '../interfaces';

@provider()
export class CheckEngine {
  public readonly checks: StaticCheckInterface[] = [...checkList];

  constructor(private service: ServiceContainerInterfaceResolver) {}

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
    return this.checks.map((c) => c.key).sort();
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
            method: name,
            karma: await instance.handle(line),
          });
        } catch (e) {
          result.push({
            status: FraudCheckStatusEnum.Error,
            method: name,
            karma: null,
            meta: {
              error: e.message,
            },
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

  async run(acquisitionId: number, input: FraudCheck[]): Promise<FraudCheckEntry> {
    const output: Map<string, FraudCheck> = new Map(input.map((i) => [i.method, i]));
    const processedMethods = input.filter((i) => i.status === 'done').map((i) => i.method);
    const methods = this.listAvailableMethods().filter((m) => !processedMethods.indexOf(m));

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

    for (const [preparer, checks] of methodInstancesMap) {
      (await this.apply(acquisitionId, checks, preparer)).map((r) => {
        output.set(r.method, r);
      });
    }

    const status = this.getStatus([...output.values()].map((v) => v.status));
    const karma = await this.getGlobalScore(output);

    return {
      acquisition_id: acquisitionId,
      status,
      karma,
      data: [...output.values()],
    };
  }

  protected getStatus(status: FraudCheckStatusEnum[]): FraudCheckStatusEnum {
    const statusEnum = [FraudCheckStatusEnum.Done, FraudCheckStatusEnum.Pending, FraudCheckStatusEnum.Error];
    return statusEnum[status.map((s) => statusEnum.indexOf(s)).reduce((s, c) => (c > s ? c : s), 0)];
  }

  async getGlobalScore(results: Map<string, FraudCheck>): Promise<number> {
    // do stuff

    return 0;
  }
}
