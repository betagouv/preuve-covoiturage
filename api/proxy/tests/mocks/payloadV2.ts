import { getRandomInt } from '../helpers/getRandomInt';

export function payloadV2(): any {
  return {
    operator_class: 'B',
    journey_id: `test-${getRandomInt(100000000)}`,
    operator_journey_id: 'a65f2757-f960-4abc-a1a1-fd7eca4a04be',
    passenger: {
      distance: 34039,
      duration: 1485,
      incentives: [],
      contribution: 76,
      seats: 1,
      identity: {
        over_18: true,
        phone_trunc: '+337672012',
        operator_user_id: `test-${getRandomInt(100000000)}`,
      },
      start: {
        datetime: '2019-07-10T11:51:07Z',
        lat: 48.77826,
        lon: 2.21223,
      },
      end: {
        datetime: '2019-07-10T12:34:14Z',
        lat: 48.82338,
        lon: 1.78668,
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
        lat: 48.77826,
        lon: 2.21223,
      },
      end: {
        datetime: '2019-07-10T12:34:14Z',
        lat: 48.82338,
        lon: 1.78668,
      },
    },
  };
}
