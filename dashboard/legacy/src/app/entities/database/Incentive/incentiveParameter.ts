import { Aom } from '../aom';

export class IncentiveParameter {
  _id: string;
  varname: string;
  label: string;
  helper: string;
  aom: Aom;
  formula: string;
  internal: boolean;

  constructor(obj?: any) {
    this._id = (obj && obj._id) || null;
    this.varname = (obj && obj.varname) || null;
    this.label = (obj && obj.label) || null;
    this.helper = (obj && obj.helper) || null;
    this.aom = (obj && obj.aom) || null;
    this.formula = (obj && obj.formula) || null;
    this.internal = (obj && obj.internal) || null;
  }
}
