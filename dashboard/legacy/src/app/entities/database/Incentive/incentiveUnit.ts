/* tslint:disable:variable-name*/

import { Aom } from '~/entities/database/aom';

export class IncentiveUnit {
  _id: string;
  name: string;
  short_name: string;
  description: string;
  aom: Aom;
  precision: number;
  financial: boolean | null;

  constructor(obj?: any) {
    this._id = (obj && obj._id) || null;
    this.name = (obj && obj.name) || null;
    this.short_name = (obj && obj.short_name) || null;
    this.description = (obj && obj.description) || null;
    this.aom = (obj && obj.aom) || null;
    this.precision = (obj && obj.precision) || null;
    this.financial = (obj && obj.financial) || null;
  }
}
