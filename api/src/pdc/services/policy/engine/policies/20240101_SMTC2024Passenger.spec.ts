import test from 'ava';
import { v4 } from 'uuid';
import { OperatorsEnum } from '../../interfaces';
import { makeProcessHelper } from '../tests/macro';
import { SMTC2024Passenger as Handler } from './20240101_SMTC2024Passenger';

const defaultPosition = {
  arr: '74278',
  com: '74278',
  aom: '200033116',
  epci: '200033116',
  dep: '74',
  reg: '84',
  country: 'XXXXX',
  reseau: '142',
};
const defaultLat = 48.72565703413325;
const defaultLon = 2.261827843187402;

const defaultCarpool = {
  _id: 1,
  operator_trip_id: v4(),
  passenger_identity_key: v4(),
  driver_identity_key: v4(),
  operator_uuid: OperatorsEnum.MOV_ICI,
  operator_class: 'C',
  passenger_is_over_18: true,
  passenger_has_travel_pass: true,
  driver_has_travel_pass: true,
  datetime: new Date('2024-05-15'),
  seats: 1,
  distance: 5_000,
  operator_journey_id: v4(),
  operator_id: 1,
  driver_revenue: 20,
  passenger_contribution: 20,
  start: { ...defaultPosition },
  end: { ...defaultPosition },
  start_lat: defaultLat,
  start_lon: defaultLon,
  end_lat: defaultLat,
  end_lon: defaultLon,
};

const process = makeProcessHelper(defaultCarpool);

test(
  'should work with exclusion',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { operator_uuid: OperatorsEnum.MOBICOOP },
      { distance: 100 },
      { distance: 30_001 },
      { operator_class: 'A' },
    ],
    meta: [],
  },
  { incentive: [0, 0, 0, 0], meta: [] },
);

test(
  'should work based on distance and seats',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 5_000, passenger_identity_key: 'one' },
      { distance: 5_000, seats: 2, passenger_identity_key: 'one' },
      { distance: 30_000, passenger_identity_key: 'two' },
    ],
    meta: [],
  },
  {
    incentive: [50, 100, 300],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 450,
      },
    ],
  },
);

test(
  'should apply daily limits',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 5_000, passenger_identity_key: 'one' },
      { distance: 5_000, passenger_identity_key: 'one' },
      { distance: 5_000, passenger_identity_key: 'one' },
      { distance: 5_000, passenger_identity_key: 'one' },
    ],
  },
  {
    incentive: [50, 50, 0, 0],
  },
);
