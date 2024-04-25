import test from 'ava';
import { v4 } from 'uuid';
import { OperatorsEnum } from '../../interfaces';
import { makeProcessHelper } from '../tests/macro';
import { GrandPoitiers as Handler } from './GrandPoitiers';
import { generatePartialCarpools } from '../tests/helpers';

// Unit test the getOperators method

test('should return the last operators if no datetime is provided', (t) => {
  const handler = new Handler(100);
  t.deepEqual(handler.getOperators(), [
    OperatorsEnum.KAROS,
    OperatorsEnum.MOBICOOP,
    OperatorsEnum.BLABLACAR_DAILY,
    OperatorsEnum.KLAXIT,
  ]);
});

test('should return Karos only if datetime is before 16/10/2023', (t) => {
  const handler = new Handler(100);
  t.deepEqual(handler.getOperators(new Date('2023-10-15')), [OperatorsEnum.KAROS]);
});

test('should return Karos and Mobicoop if datetime is after 16/10/2023', (t) => {
  const handler = new Handler(100);
  t.deepEqual(handler.getOperators(new Date('2023-10-16')), [OperatorsEnum.KAROS, OperatorsEnum.MOBICOOP]);
});

test('should return all operators if datetime is after 22/12/2023', (t) => {
  const handler = new Handler(100);
  t.deepEqual(handler.getOperators(new Date('2023-12-23')), [
    OperatorsEnum.KAROS,
    OperatorsEnum.MOBICOOP,
    OperatorsEnum.BLABLACAR_DAILY,
    OperatorsEnum.KLAXIT,
  ]);
});

// Unit test calculations

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
  operator_uuid: OperatorsEnum.KAROS,
  operator_class: 'C',
  passenger_is_over_18: true,
  passenger_has_travel_pass: true,
  driver_has_travel_pass: true,
  datetime: new Date('2023-11-15'),
  seats: 1,
  duration: 600,
  distance: 7_000,
  cost: 20,
  driver_payment: 20,
  passenger_payment: 20,
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
      { operator_uuid: 'not in list' },
      { distance: 100 },
      { operator_class: 'A' },
      { operator_class: 'B' },
      { distance: 81_000 },
      { operator_uuid: OperatorsEnum.MOBICOOP, datetime: new Date('2023-11-15') },
    ],
    meta: [],
  },
  { incentive: [0, 0, 0, 0, 0, 0], meta: [] },
);

test(
  'should work basic',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 5_000, driver_identity_key: 'one' },
      { distance: 79_999, seats: 2, driver_identity_key: 'one', passenger_identity_key: 'three' },
      {
        distance: 5_000,
        driver_identity_key: 'two',
        operator_uuid: OperatorsEnum.MOBICOOP,
        datetime: new Date('2023-11-16'),
      },
    ],
    meta: [],
  },
  {
    incentive: [150, 300, 150],
    meta: [
      {
        key: 'max_amount_restriction.0-one.month.10-2023',
        value: 450,
      },
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 600,
      },
      {
        key: 'max_amount_restriction.0-two.month.10-2023',
        value: 150,
      },
    ],
  },
);

test(
  'should work with driver month limits',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 6_000, driver_identity_key: 'one' },
      { distance: 6_000, driver_identity_key: 'one' },
    ],
    meta: [
      {
        key: 'max_amount_restriction.0-one.month.10-2023',
        value: 119_00,
      },
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 119_00,
      },
    ],
  },
  {
    incentive: [100, 0],
    meta: [
      {
        key: 'max_amount_restriction.0-one.month.10-2023',
        value: 120_00,
      },
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 120_00,
      },
    ],
  },
);

test(
  'should work with driver day limits',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 6_000, driver_identity_key: '11', passenger_identity_key: '21', operator_trip_id: '1' },
      { distance: 6_000, driver_identity_key: '11', passenger_identity_key: '22', operator_trip_id: '2' },
      { distance: 6_000, driver_identity_key: '11', passenger_identity_key: '23', operator_trip_id: '3' },
      { distance: 6_000, driver_identity_key: '11', passenger_identity_key: '24', operator_trip_id: '4' },
      { distance: 6_000, driver_identity_key: '11', passenger_identity_key: '25', operator_trip_id: '5' },
      { distance: 6_000, driver_identity_key: '11', passenger_identity_key: '26', operator_trip_id: '6' },
      { distance: 6_000, driver_identity_key: '11', passenger_identity_key: '26', operator_trip_id: '6' },
    ],
    meta: [],
  },
  {
    incentive: [150, 150, 150, 150, 150, 150, 0],
    meta: [
      {
        key: 'max_amount_restriction.0-11.month.10-2023',
        value: 900,
      },
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 900,
      },
    ],
  },
);

test(
  'should work with passenger day limits',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 6_000, driver_identity_key: '11', passenger_identity_key: '21', operator_trip_id: '1' },
      { distance: 6_000, driver_identity_key: '11', passenger_identity_key: '21', operator_trip_id: '2' },
      { distance: 6_000, driver_identity_key: '11', passenger_identity_key: '21', operator_trip_id: '3' },
    ],
    meta: [],
  },
  {
    incentive: [150, 150, 0],
    meta: [
      {
        key: 'max_amount_restriction.0-11.month.10-2023',
        value: 300,
      },
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 300,
      },
    ],
  },
);

test(
  'should work with driver amount month limits',
  process,
  {
    policy: { handler: Handler.id },
    carpool: generatePartialCarpools(80),
    meta: [],
  },
  {
    incentive: [...[...Array(80).keys()].map(() => 150), 0],
    meta: [
      {
        key: 'max_amount_restriction.0-three.month.0-2022',
        value: 120_00,
      },
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 120_00,
      },
    ],
  },
);
