export const requestJourney = {
  operator_class: 'B',
  journey_id: ((): string => `${Math.random()}-${Math.random()}-${Math.random()}`)(),
  operator_journey_id: 'a65f2757-a324-4fde-a1a9-fd1acb2a04be',
  passenger: {
    distance: 34039,
    duration: 1485,
    incentives: [],
    expense: 76,
    contribution: 76,
    seats: 1,
    identity: {
      over_18: true,
      phone: '+33661201234',
    },
    start: {
      postcodes: [],
      datetime: '2019-07-10T11:51:07Z',
      lat: 48.77826,
      lon: 2.21223,
    },
    end: {
      postcodes: [],
      datetime: '2019-07-10T12:34:14Z',
      lat: 48.82338,
      lon: 1.78668,
    },
  },
  driver: {
    distance: 34039,
    duration: 1485,
    expense: 0,
    incentives: [],
    revenue: 376,
    identity: {
      over_18: true,
      phone: '+33643444322',
    },
    start: {
      postcodes: [],
      datetime: '2019-07-10T11:51:07Z',
      lat: 48.77826,
      lon: 2.21223,
    },
    end: {
      postcodes: [],
      datetime: '2019-07-10T12:34:14Z',
      lat: 48.82338,
      lon: 1.78668,
    },
  },
};
