import { RetributionRuleInterface } from '@pdc/provider-schema';

import { adultOnly } from './adultOnly';
import { maxAmount } from './maxAmount';
import { maxAmountPerTarget } from './maxAmountPerTarget';
import { maxTrip } from './maxTrip';
import { maxTripPerTarget } from './maxTripPerTarget';
import { retributionMeltingpot } from './retributionMeltingpot';

export const policies: RetributionRuleInterface[] = [
  adultOnly,
  maxAmount,
  maxAmountPerTarget,
  maxTrip,
  maxTripPerTarget,
  retributionMeltingpot,
];
