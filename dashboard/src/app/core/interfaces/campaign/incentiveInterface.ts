import { IncentiveUnitEnum } from '~/core/enums/campaign/incentive-unit.enum';

export interface IncentiveInterface {
  amount: number;
  amount_unit: IncentiveUnitEnum;
}
