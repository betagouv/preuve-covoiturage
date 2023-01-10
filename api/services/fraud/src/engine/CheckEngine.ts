import { randomUUID } from 'crypto';
import { provider, ServiceContainerInterfaceResolver, NewableType } from '@ilos/common';

import { checks as checkList } from './checks';
import {
  StaticCheckInterface,
  CheckInterface,
  HandleCheckInterface,
  PrepareCheckInterface,
} from '../interfaces/CheckInterface';

import { FraudCheck, FraudCheckStatusEnum, FraudCheckEntry, FraudCheckResult } from '../interfaces';
import { scoringRules, scoringFallback } from './helpers/scoring';

@provider()
export class CheckEngine {
  public readonly checks: Map<string, StaticCheckInterface>;

  constructor(private service: ServiceContainerInterfaceResolver) {
    this.checks = new Map(checkList.map((c) => [c.key, c]));
  }

  /**
   *  Get a processor ctor from a method string
   */
  protected getCheckProcessor(method: string): NewableType<CheckInterface | HandleCheckInterface> {
    const processorCtor = this.checks.get(method);
    if (!processorCtor || typeof processorCtor !== 'function') {
      throw new Error(`Unknown check ${method}`);
    }
    return processorCtor;
  }

  /**
   *  List all available fraud check methods
   */
  listAvailableMethods(): string[] {
    return [...this.checks.keys()];
  }

  async apply(
    acquisition_id: number,
    methods: Map<string, HandleCheckInterface>,
    preparerCtor: NewableType<PrepareCheckInterface>,
  ): Promise<FraudCheck[]> {
    const preparer = this.service.get<PrepareCheckInterface>(preparerCtor);
    const data = await preparer.prepare(acquisition_id);
    if (!data) {
      return [];
    }
    const result: Map<string, FraudCheck> = new Map();
    const uuid = randomUUID();
    for (const [name, instance] of methods.entries()) {
      const cb = (karma: FraudCheckResult, cbAcquisitionId = acquisition_id, data?: any) => {
        result.set(`${name}-${cbAcquisitionId}`, {
          uuid,
          acquisition_id: cbAcquisitionId,
          status: FraudCheckStatusEnum.Done,
          method: name,
          karma,
          data,
        });
      };
      try {
        await instance.handle(data, cb);
      } catch (e) {
        result.set(`${name}-${acquisition_id}`, {
          uuid,
          acquisition_id,
          status: FraudCheckStatusEnum.Error,
          method: name,
          karma: null,
          data: {
            error: e.message,
          },
        });
        throw e;
      }
    }
    return [...result.values()];
  }

  protected hasExternalPreparer(check: HandleCheckInterface | CheckInterface): check is HandleCheckInterface {
    return (check as HandleCheckInterface).preparer !== undefined;
  }

  async run(acquisitionId: number, input: FraudCheck[]): Promise<FraudCheckEntry> {
    const output: Map<string, FraudCheck> = new Map(input.map((i) => [i.method, i]));
    const processedMethods = input.filter((i) => i.status === 'done').map((i) => i.method);
    const methods = this.listAvailableMethods().filter((m) => processedMethods.indexOf(m) < 0);
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
    const rules = [...scoringRules];
    for (const [threshold, ruleSet] of rules) {
      if (
        ruleSet
          .map((name) => {
            if (!results.has(name)) {
              throw new Error(`Unknown test ${name}`);
            }
            const res = results.get(name);
            if (res.status !== 'done') {
              throw new Error(`Test ${res.method} has non done status (${res.status})`);
            }
            return results.get(name);
          })
          .map((r) => r.karma)
          .reduce((acc, r) => acc + r, 0) >= threshold
      ) {
        return 1;
      }
    }
    const fallback = [...scoringFallback];
    const fallbackFiltered: { coef: number; rule: FraudCheck }[] = fallback.map((fb) => {
      const [coef, ruleName] = fb;
      if (!results.has(ruleName)) {
        throw new Error(`Unknown fallback test ${ruleName}`);
      }
      const rule = results.get(ruleName);
      if (rule.status !== 'done') {
        throw new Error(`Test ${rule.method} has non done status (${rule.status})`);
      }
      return { coef, rule };
    });

    const nb = fallbackFiltered.map((fb) => fb.coef).reduce((acc, i) => i + acc, 0);

    return Math.min(
      fallbackFiltered
        .map((fb: { coef: number; rule: FraudCheck }) => {
          const { coef, rule } = fb;
          return coef * rule.karma;
        })
        .reduce((acc, r) => acc + r, 0) / nb,
      1,
    );
  }
}
