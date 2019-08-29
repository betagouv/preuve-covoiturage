import {
  FormulaUnitType,
  IncentiveFormulaInterface,
  IncentiveFormulaParameterInterface,
} from '~/core/interfaces/campaign/campaignInterface';

export class IncentiveFormula {
  formula: string;
  constructor(obj: IncentiveFormulaInterface) {
    this.formula = obj.formula;
  }
}
