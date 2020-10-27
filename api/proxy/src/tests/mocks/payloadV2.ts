import { uuid } from '@pdc/helper-test';

export function payloadV2(): any {
  return {
    operator_class: 'B',
    journey_id: uuid(),
    operator_journey_id: uuid(),
    passenger: {
      distance: 34039,
      duration: 1485,
      incentives: [],
      contribution: 76,
      seats: 1,
      identity: {
        over_18: true,
        phone_trunc: '+337672012',
        operator_user_id: uuid(),
      },
      start: {
        datetime: '2019-07-10T11:51:07Z',
        lat: 47.202794,
        lon: -1.459764,
      },
      end: {
        datetime: '2019-07-10T12:34:14Z',
        lat: 47.237308,
        lon: -1.459625,
      },
    },
    driver: {
      distance: 34039,
      duration: 1485,
      incentives: [],
      revenue: 376,
      identity: {
        over_18: true,
        phone: '+33783884322',
      },
      start: {
        datetime: '2019-07-10T11:51:07Z',
        lat: 47.202794,
        lon: -1.459764,
      },
      end: {
        datetime: '2019-07-10T12:34:14Z',
        lat: 47.237308,
        lon: -1.459625,
      },
    },
  };
}
