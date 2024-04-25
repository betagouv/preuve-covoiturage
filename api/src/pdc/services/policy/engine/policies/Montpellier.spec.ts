import test from 'ava';
import { v4 } from 'uuid';
import { OperatorsEnum } from '../../interfaces';
import { makeProcessHelper } from '../tests/macro';
import { Montpellier as Handler } from './Montpellier';
import { generatePartialCarpools } from '../tests/helpers';

const defaultPosition = {
  arr: '34088',
  com: '34088',
  aom: '243400017',
  epci: '243400017',
  dep: '34',
  reg: '76',
  country: 'XXXXX',
  reseau: '76',
};
const defaultLat = 48.72565703413325;
const defaultLon = 2.261827843187402;

const defaultCarpool = {
  _id: 1,
  operator_trip_id: v4(),
  passenger_identity_key: v4(),
  driver_identity_key: v4(),
  operator_uuid: OperatorsEnum.KLAXIT,
  operator_class: 'C',
  passenger_is_over_18: true,
  passenger_has_travel_pass: true,
  driver_has_travel_pass: true,
  datetime: new Date('2022-01-01'),
  seats: 1,
  duration: 600,
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
  'should work basic',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 5_000, driver_identity_key: 'one' },
      { distance: 5_000, seats: 2, driver_identity_key: 'one' },
      { distance: 25_000, driver_identity_key: 'one' },
      { distance: 25_000, seats: 2, driver_identity_key: 'one' },
      {
        distance: 25_000,
        driver_identity_key: 'one',
        start: { aom: '200096956', com: '47091', arr: '47091', epci: '200096956', reg: '75' },
      },
    ],
    meta: [],
  },
  {
    incentive: [100, 200, 200, 400, 200],
    meta: [
      {
        key: 'max_amount_restriction.0-one.month.0-2022',
        value: 1100,
      },
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 1100,
      },
    ],
  },
);

test(
  'should work with day limits',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 25_000, driver_identity_key: 'two' },
      { distance: 25_000, driver_identity_key: 'two' },
      { distance: 25_000, driver_identity_key: 'two' },
      { distance: 25_000, driver_identity_key: 'two' },
      { distance: 25_000, driver_identity_key: 'two' },
      { distance: 25_000, driver_identity_key: 'two' },
      { distance: 25_000, driver_identity_key: 'two' },
    ],
    meta: [],
  },
  {
    incentive: [200, 200, 200, 200, 200, 200, 0],
    meta: [
      {
        key: 'max_amount_restriction.0-two.month.0-2022',
        value: 12_00,
      },
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 12_00,
      },
    ],
  },
);

test(
  'should work with driver month limits',
  process,
  {
    policy: { handler: Handler.id },
    carpool: generatePartialCarpools(),
    meta: [],
  },
  {
    incentive: [...[...Array(75).keys()].map(() => 200), 0],
    meta: [
      {
        key: 'max_amount_restriction.0-three.month.0-2022',
        value: 150_00,
      },
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 15000,
      },
    ],
  },
);
