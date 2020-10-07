import { provider } from '@ilos/common';

import { DatetimeIdentityCheckParamsInterface } from './DatetimeIdentityCheckParamsInterface';
import { HandleCheckInterface, FraudCheckResult } from '../../../interfaces';
import { DatetimeIdentityCheckPreparator } from '../DatetimeIdentityCheckPreparator';
import { step } from '../../helpers/math';

@provider()
export class DatetimeIdentitySequenceCheck implements HandleCheckInterface<DatetimeIdentityCheckParamsInterface> {
  public readonly preparer = DatetimeIdentityCheckPreparator;
  public static readonly key: string = 'datetimeIdentitySequenceCheck';

  protected readonly max: number = 600; // above = 0
  protected readonly min: number = 0; // below = 100

  async handle(data: DatetimeIdentityCheckParamsInterface): Promise<FraudCheckResult> {
    return (
      1 -
      step(
        data
          .filter((d) => d.interval > 0)
          .reduce((max, i) => {
            max = Math.max(max, i.interval);
            return max;
          }, 0),
        this.min,
        this.max,
      )
    );
  }
}
