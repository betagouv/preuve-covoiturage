import { IncentiveUnit } from '~/core/entities/campaign/IncentiveUnit';

export interface IncentiveInterface {
  amount: number;
  amount_unit: IncentiveUnit;
}
