import { provider } from '@ilos/common';

import { DatetimeIdentityCheckParamsInterface } from './DatetimeIdentityCheckParamsInterface';
import { HandleCheckInterface, CheckHandleCallback } from '../../../interfaces';
import { DatetimeIdentityCheckPreparator } from '../DatetimeIdentityCheckPreparator';

@provider()
export class DatetimeIdentityCollisionCheck implements HandleCheckInterface<DatetimeIdentityCheckParamsInterface> {
  public readonly preparer = DatetimeIdentityCheckPreparator;
  public static readonly key: string = 'datetimeIdentityCollisionCheck';

  async handle(data: DatetimeIdentityCheckParamsInterface, cb: CheckHandleCallback): Promise<void> {
    cb(data.filter((d) => d.inside).length > 0 ? 1 : 0);
  }
}
