export const JOURNEY_HEADER = {


  main: {
    journey: [
      'operator.nom_commercial',
      'operator_class',
      'passenger.distance',
      'passenger.seats',
      'passenger.start.datetime',
      'passenger.end.datetime',
      'passenger.start.town',
      'passenger.end.town',
      'operator_class',
    ],
    driverPassenger: [
      'start.insee',
      'end.insee',
      'cost',
    ],
  },
  selection: {
    journey: [
      'passenger.start.date',
      'passenger.start.day',
      'passenger.start.time',
      'passenger.start.town',
      'passenger.end.town',
      'passenger.distance',
      'operator_class',
      'operator.nom_commercial',
    ],
    driver: [
      'validation.rank',
      'start.datetime',
      'end.datetime',
      'start.town',
      'end.town',
      'start.lat',
      'start.lng',
      'end.lat',
      'end.lng',
      'traveler_hash',
    ],
    passenger: [
      'over_18',
      'validation.rank',
      'start.datetime',
      'end.datetime',
      'start.town',
      'end.town',
      'start.lat',
      'start.lng',
      'end.lat',
      'end.lng',
      'traveler_hash',
    ],
  },
  sort : {
    journey: [
      'passenger.start.date',
      'passenger.distance',
      'operator_class',
    ],
  },

};
