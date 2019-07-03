export const journey = {
    journey_id: 'journeyId',
    operator_journey_id: 'operatorJourneyId',
    operator_class: 'A',
    operator: {
      _id: 'operatorId',
      nom_commercial: 'commercial_name',
    },
    passenger: {
      _id: 'passengerId',
      identity: {
        firstname: 'passengerFirstName',
        lastname: 'passengerLastName',
        email: 'passenger@example.com',
        phone: '062244558899',
      },
      start: {
        datetime: new Date(),
        lat: 1,
        lon: 2,
      },
      end: {
        datetime: new Date(+2),
        lat: 1,
        lon: 2,
      },
      distance: 2,
      duration: 50,
      cost: 1,
      incentive: 1,
      remaining_fee: 1,
    },
    driver: {
      _id: 'driverId',
      identity: {
        firstname: 'driverFirstName',
        lastname: 'driverLastName',
        email: 'driver@example.com',
        phone: '062244558899',
      },
      start: {
        datetime: new Date(),
        lat: 1,
        lon: 2,
      },
      end: {
        datetime: new Date(+2),
        lat: 1,
        lon: 2,
      },
      distance: 2,
      duration: 50,
      cost: 1,
      incentive: 1,
      remaining_fee: 1,
    },
};
