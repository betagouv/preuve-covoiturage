import { IncentiveCounterpartTarget, InsertableCarpool, OperatorClass, UpdatableCarpool } from '../../interfaces';

export const insertableCarpool: InsertableCarpool = {
  operator_id: 1,
  operator_journey_id: 'journey_id_1',
  operator_trip_id: 'operator_trip_id_1',
  operator_class: OperatorClass.C,
  start_datetime: new Date('2023-01-01T01:01:01.000Z'),
  start_position: {
    lat: 48.729958,
    lon: 2.2592852,
  },
  end_datetime: new Date('2023-01-01T01:21:01.000Z'),
  end_position: {
    lat: 48.700901,
    lon: 2.2389599,
  },
  distance: 3542,
  licence_plate: 'ZZ-0123-AD',
  driver_identity_key: '0000000000000000000000000000000000000000000000000000000000000000',
  driver_operator_user_id: 'driver_operator_user_id_1',
  driver_phone: null,
  driver_phone_trunc: null,
  driver_travelpass_name: null,
  driver_travelpass_user_id: null,
  driver_revenue: 200,
  passenger_identity_key: '1111111111111111111111111111111111111111111111111111111111111111',
  passenger_operator_user_id: 'driver_operator_user_id_2',
  passenger_phone: null,
  passenger_phone_trunc: null,
  passenger_travelpass_name: null,
  passenger_travelpass_user_id: null,
  passenger_over_18: true,
  passenger_seats: 1,
  passenger_contribution: 100,
  passenger_payments: [{ index: 0, amount: 100, siret: '1234678900013', type: 'Cash' }],
  incentives: [
    { index: 0, amount: 50, siret: '1234678900012' },
    { index: 1, amount: 50, siret: '1234678900013' },
  ],
  incentive_counterparts: [
    { target: IncentiveCounterpartTarget.Passenger, amount: 50, siret: '1234678900012' },
    { target: IncentiveCounterpartTarget.Passenger, amount: 50, siret: '1234678900013' },
  ],
};

export const updatableCarpool: UpdatableCarpool = {
  operator_trip_id: 'operator_trip_id_2',
  operator_class: OperatorClass.B,
  end_datetime: new Date('2023-01-01T01:31:01.000Z'),
  end_position: {
    lat: 48.700001,
    lon: 2.2380599,
  },
  passenger_travelpass_name: 'Jean',
  passenger_contribution: 50,
  passenger_payments: [{ index: 0, amount: 50, siret: '1234678900013', type: 'Cash' }],
  incentives: [
    { index: 0, amount: 25, siret: '1234678900012' },
    { index: 1, amount: 25, siret: '1234678900013' },
  ],
  incentive_counterparts: [{ target: IncentiveCounterpartTarget.Passenger, amount: 50, siret: '1234678900013' }],
};
