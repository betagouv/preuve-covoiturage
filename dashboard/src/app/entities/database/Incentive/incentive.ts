/* tslint:disable:variable-name*/


import { Operator } from '~/entities/database/operator';
import { Trip } from '~/entities/database/trip/trip';
import { IncentiveCampaign } from '~/entities/database/Incentive/incentiveCampaign';

export class Incentive {
  _id: string;
  operator: string | Operator;
  campaign: string | IncentiveCampaign;
  target: string;
  trip: string | Trip;
  unit: number;
  amount: number;
  status: { 'pending', 'validated', 'consumed' };


  constructor(obj?: any) {
    this._id = obj && obj._id || null;
    this.campaign = obj && obj.campaign || null;
    this.target = obj && obj.target || null;
    this.trip = obj && obj.trip || null;
    this.unit = obj && obj.unit || null;
    this.amount = obj && obj.amount || null;
    this.status = obj && obj.status || null;
  }
}

