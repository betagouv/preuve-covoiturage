import { provider } from '@ilos/common';

import { DatetimeIdentityCheckParamsInterface } from './DatetimeIdentityCheckParamsInterface';
import { HandleCheckInterface, FraudCheckResult } from '../../../interfaces';
import { DatetimeIdentityCheckPreparator } from '../DatetimeIdentityCheckPreparator';

@provider()
export class DatetimeIdentityCollisionCheck implements HandleCheckInterface<DatetimeIdentityCheckParamsInterface> {
  public readonly preparer = DatetimeIdentityCheckPreparator;
  public static readonly key: string = 'datetimeIdentityCollisionCheck';

  async handle(data: DatetimeIdentityCheckParamsInterface): Promise<FraudCheckResult> {
    return data.filter((d) => d.inside).length > 0 ? 1 : 0;
  }
}
