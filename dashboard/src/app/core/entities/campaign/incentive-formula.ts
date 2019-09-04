import { IncentiveFormulaInterface } from '~/core/interfaces/campaign/campaignInterface';

export class IncentiveFormula {
  formula: string;
  constructor(obj: IncentiveFormulaInterface) {
    this.formula = obj.formula;
  }
}
