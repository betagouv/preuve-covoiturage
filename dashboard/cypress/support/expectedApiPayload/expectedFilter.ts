import { FilterInterface } from '../../../src/app/core/interfaces/filter/filterInterface';
import { TripStatusEnum } from '../../../src/app/core/enums/trip/trip-status.enum';
import { TripRankEnum } from '../../../src/app/core/enums/trip/trip-rank.enum';

import { campaignStubs } from '../stubs/campaign/campaign.list';
import { territoryStub } from '../stubs/territory/territory.find';
import { operatorStub } from '../stubs/operator/operator.find';

export const filterStartMoment = Cypress.moment().add(1, 'days').startOf('day');
export const filterEndMoment = Cypress.moment().add(3, 'months').endOf('day');

export const expectedFilter: FilterInterface = {
  campaign_id: [campaignStubs[0]._id, campaignStubs[1]._id],
  date: <any>{
    start: filterStartMoment.toISOString(),
    end: filterEndMoment.toISOString(),
  },
  hour: {
    start: 18,
    end: 22,
  },
  days: [1, 2],
  // insee: ['69123', '69266'],
  distance: {
    min: 80000,
    max: 123000,
  },
  ranks: [TripRankEnum.A, TripRankEnum.B],
  status: TripStatusEnum.EXPIRED,
  operator_id: [operatorStub._id],
  territory_id: [territoryStub._id],
};
