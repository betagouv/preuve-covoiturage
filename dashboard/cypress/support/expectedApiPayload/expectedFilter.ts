import { FilterInterface } from '../../../src/app/core/interfaces/filter/filterInterface';
import { UserGroupEnum } from '../../../src/app/core/enums/user/user-group.enum';
import { TripStatusEnum } from '../../../src/app/core/enums/trip/trip-status.enum';
import { TripRankEnum } from '../../../src/app/core/enums/trip/trip-rank.enum';

import { campaignStubs } from '../stubs/campaign/campaign.list';
import { operatorStubs } from '../stubs/operator/operator.list';
import { cypress_logging_users } from '../stubs/auth/login';
import { territoryStub } from '../stubs/territory/territory.find';
import { operatorStub } from '../stubs/operator/operator.find';

export const filterStartMoment = Cypress.moment()
  .add(1, 'days')
  .startOf('day');
export const filterEndMoment = Cypress.moment()
  .add(3, 'months')
  .startOf('day');

export const expectedFilter: FilterInterface = {
  campaign_id: [campaignStubs[0]._id, campaignStubs[1]._id],
  date: <any>{
    start: `${filterStartMoment.toISOString(true).substr(0, 10)}T00:00:00Z`,
    end: `${filterEndMoment.toISOString(true).substr(0, 10)}T23:59:59Z`,
  },
  hour: {
    start: 18,
    end: 22,
  },
  days: [0, 1],
  insees: ['69123', '69266'],
  distance: {
    min: 80000,
    max: 123000,
  },
  ranks: [TripRankEnum.A, TripRankEnum.B],
  status: TripStatusEnum.LOCKED,
  operator_id: [operatorStub._id],
  territory_id: [territoryStub._id],
};
