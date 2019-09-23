import { FilterInterface } from '../../../src/app/core/interfaces/filter/filterInterface';
import { UserGroupEnum } from '../../../src/app/core/enums/user/user-group.enum';
import { TripStatusEnum } from '../../../src/app/core/enums/trip/trip-status.enum';
import { TripRankEnum } from '../../../src/app/core/enums/trip/trip-rank.enum';

import { campaignStubs } from '../stubs/campaign.list';
import { operatorStubs } from '../stubs/operator.list';
import { cypress_logging_users } from '../stubs/login';

export const filterStartMoment = Cypress.moment()
  .add(1, 'days')
  .startOf('day');
export const filterEndMoment = Cypress.moment()
  .add(3, 'months')
  .startOf('day');

export const expectedFilter: FilterInterface = {
  campaign_id: [campaignStubs[0]._id, campaignStubs[1]._id],
  date: <any>{
    start: filterStartMoment.toDate().toISOString(),
    end: filterEndMoment.toDate().toISOString(),
  },
  hour: {
    start: 18,
    end: 22,
  },
  days: [0, 1],
  towns: ['Lyon'],
  distance: {
    min: 4,
    max: 123,
  },
  ranks: [TripRankEnum.A, TripRankEnum.B],
  status: TripStatusEnum.PENDING,
  operator_id: [operatorStubs[0]._id],
  territory_id: [cypress_logging_users[UserGroupEnum.TERRITORY].territory],
};
