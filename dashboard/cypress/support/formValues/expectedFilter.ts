import { FilterInterface } from '../../../src/app/core/interfaces/filter/filterInterface';
import { TripStatusEnum } from '../../../src/app/core/enums/trip/trip-status.enum';
import { TripClassEnum } from '../../../src/app/core/enums/trip/trip-class.enum';

import { campaignStubs } from '../stubs/campaign.list';
import { operatorStubs } from '../stubs/operator.list';
import { territoryStubs } from '../stubs/territory.list';

export const filterStartMoment = Cypress.moment()
  .add(1, 'days')
  .startOf('day');
export const filterEndMoment = Cypress.moment()
  .add(3, 'months')
  .startOf('day');

export const expectedFilter: FilterInterface = {
  campaignIds: [campaignStubs[0]._id],
  date: {
    start: filterStartMoment.toDate(),
    end: filterEndMoment.toDate(),
  },
  hour: {
    start: '18:00',
    end: '22:00',
  },
  days: [0, 1],
  towns: ['Lyon'],
  distance: {
    min: 4,
    max: 123,
  },
  ranks: [TripClassEnum.A, TripClassEnum.B],
  status: TripStatusEnum.PENDING,
  operatorIds: [operatorStubs[0]._id],
  territoryIds: [territoryStubs[0]._id],
};
