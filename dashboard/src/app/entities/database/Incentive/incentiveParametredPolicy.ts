import { IncentivePolicy } from '~/entities/database/Incentive/incentivePolicy';

import { IncentiveParameterValue } from './incentiveParameterValue';

export class IncentiveParametredPolicy {
  policy: IncentivePolicy;
  parameters: [IncentiveParameterValue];

  constructor(obj?: any) {
    this.policy = (obj && obj.policy) || null;
    this.parameters = (obj && obj.parameters) || null;
  }
}
