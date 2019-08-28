import {
  FormulaUnitType,
  IncentiveFormulaInterface,
  IncentiveFormulaParameterInterface,
} from '~/core/interfaces/campaign/campaignInterface';

export class IncentiveFormula {
  name?: string;
  formula: string;
  unit: FormulaUnitType;
  parameters: IncentiveFormulaParameterInterface[];
  constructor(obj: IncentiveFormulaInterface) {
    this.formula = obj.formula;
    this.unit = obj.unit;
    this.parameters = obj.parameters;
  }
}
