import { IncentiveFormulaParameterInterface } from '~/core/interfaces/campaign/campaignInterface';

export class IncentiveFormulaParameter {
  _id: string = null; // needed for apiservice
  varname: string;
  internal: boolean;
  helper: string;
  value?: string | number | boolean | null;
  constructor(obj: IncentiveFormulaParameterInterface) {
    this.varname = obj.varname;
    this.internal = obj.internal;
    this.helper = obj.helper;
    this.value = obj.value;
  }
}
