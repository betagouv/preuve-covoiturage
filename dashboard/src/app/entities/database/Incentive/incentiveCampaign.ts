import { Trip } from '~/entities/database/trip/trip';
import { IncentiveParametredPolicy } from '~/entities/database/Incentive/incentiveParametredPolicy';

import { Aom } from '../aom';

export class IncentiveCampaign {
  _id: string;
  aom: Aom;
  start: Date;
  end: Date;
  status: { 'pending', 'validated', 'paid' };
  policies: [IncentiveParametredPolicy];
  trips: [Trip];
  name: string;
  description: string;

  constructor(obj?: any) {
    this._id = obj && obj._id || null;
    this.name = obj && obj.name || null;
    this.description = obj && obj.description || null;
    this.aom = obj && obj.aom || null;
    this.start = obj && obj.start || null;
    this.end = obj && obj.end || null;
    this.status = obj && obj.status || null;
    this.policies = obj && obj.policies || null;
    this.trips = obj && obj.trips || null;
  }
}
