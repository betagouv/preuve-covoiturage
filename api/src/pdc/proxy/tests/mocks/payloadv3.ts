import { uuid } from '/pdc/providers/test/index.ts';

export function payloadv3(): any {
  return {
    operator_journey_id: uuid(),
    operator_class: 'B',
    incentives: [],
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
    distance: 34039,
    driver: {
      revenue: 376,
      identity: {
        over_18: true,
        phone: '+33783884322',
      },
    },
    passenger: {
      contribution: 76,
      seats: 1,
      identity: {
        over_18: true,
        phone_trunc: '+337672012',
        operator_user_id: uuid(),
      },
    },
    operator_trip_id: uuid(),
  };
}
