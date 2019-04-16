import { IncentiveParameter } from '~/entities/database/Incentive/incentiveParameter';
import { IncentiveUnit } from '~/entities/database/Incentive/incentiveUnit';
import { IncentiveRule } from '~/entities/database/Incentive/IncentiveRule';

import { Aom } from '../aom';

export class IncentivePolicy {
  _id: string;
  aom: Aom;
  name: string;
  description: string;
  rules: [IncentiveRule];
  parameters: IncentiveParameter[];
  unit: IncentiveUnit;
  formula: string;
  status: { 'draft', 'active', 'archived' };


  constructor(obj?: any) {
    this._id = obj && obj._id || null;
    this.aom = obj && obj.aom || null;
    this.name = obj && obj.name || null;
    this.description = obj && obj.description || null;
    this.rules = obj && obj.rules || null;
    this.parameters = obj && obj.parameters || null;
    this.unit = obj && obj.unit || null;
    this.formula = obj && obj.formula || null;
    this.status = obj && obj.status || null;
  }
}
