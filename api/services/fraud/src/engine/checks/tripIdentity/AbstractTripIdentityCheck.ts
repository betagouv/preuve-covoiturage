import { TripIdentityCheckParamsInterface } from './TripIdentityCheckParamsInterface';
import { HandleCheckInterface, FraudCheckResult } from '../../../interfaces';
import { TripIdentityCheckPreparator } from '../TripIdentityCheckPreparator';

export abstract class AbstractTripIdentityCheck implements HandleCheckInterface<TripIdentityCheckParamsInterface> {
  public readonly preparer = TripIdentityCheckPreparator;
  protected abstract keys: string[];

  async handle(data: TripIdentityCheckParamsInterface): Promise<FraudCheckResult> {
    const scopedData = data.map((d) => {
      const arr = [];
      for (const key of this.keys) {
        arr.push(d[key]);
      }
      return arr;
    });
    return this.count(scopedData) / data.length;
  }

  protected count(field: string[][]): number {
    return [
      ...field
        .filter((v) => {
          return !(v.findIndex((vv) => !!!vv) > -1);
        })
        .map((v) => v.join('.'))
        .reduce((m, s) => {
          const count = m.get(s) || 0;
          m.set(s, count + 1);
          return m;
        }, new Map<string, number>())
        .values(),
    ]
      .filter((v) => v > 1)
      .reduce((c, vc) => c + vc, 0);
  }
}
