import test from 'ava';
import { v4 } from 'uuid';
import { CarpoolInterface, OperatorsEnum } from '../../interfaces';
import { makeProcessHelper } from '../tests/macro';
import { Occitanie20232024 as Handler } from './20221024_Occitanie';

const defaultPosition = {
  arr: '46240',
  com: '46240',
  aom: '200053791',
  epci: '200066371',
  dep: '46',
  reg: '76',
  country: 'XXXXX',
  reseau: '465',
};
const defaultLat = 48.72565703413325;
const defaultLon = 2.261827843187402;

const defaultCarpool: CarpoolInterface = {
  operator_trip_id: v4(),
  passenger_identity_key: v4(),
  driver_identity_key: v4(),
  operator_uuid: OperatorsEnum.BLABLACAR_DAILY,
  operator_class: 'C',
  passenger_is_over_18: true,
  passenger_has_travel_pass: true,
  driver_has_travel_pass: true,
  datetime: new Date('2022-11-15'),
  seats: 1,
  distance: 5_000,
  operator_journey_id: v4(),
  operator_id: 1,
  start: { ...defaultPosition },
  end: { ...defaultPosition },
  start_lat: defaultLat,
  start_lon: defaultLon,
  end_lat: defaultLat,
  end_lon: defaultLon,
  driver_meta: {},
  driver_revenue: 10,
  passenger_contribution: 10,
  passenger_meta: {
    payments: [{ siret: OperatorsEnum.BLABLACAR_DAILY, type: 'payment', amount: 10 }],
  },
};

const process = makeProcessHelper(defaultCarpool);

test(
  'should work with exclusion',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 40_000 }, // distance
      { operator_class: 'A' }, // operator_class
      { operator_uuid: 'not_a_real_operator' }, // operator
      { datetime: new Date('2022-11-06') }, // not on sunday
      { datetime: new Date('2022-11-07') }, // works on other day
      { start: { ...defaultPosition, reg: 'not_in_region' } }, // starts/end in region only
      // but not inside same aom if not region
      { start: { ...defaultPosition, aom: 'aom1' }, end: { ...defaultPosition, aom: 'aom1' } },
      { start: { ...defaultPosition, aom: 'aom1' }, end: { ...defaultPosition, aom: 'aom2' } },
      { passenger_contribution: 0 },
      { passenger_contribution: 0, datetime: new Date('2022-10-28') },
    ],
    meta: [],
  },
  {
    incentive: [0, 0, 0, 0, 190, 0, 0, 190, 0, 200],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 580,
      },
    ],
  },
);

test(
  'should work basic',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 5_000, driver_identity_key: 'one' },
      { distance: 25_000, driver_identity_key: 'two' },
      { distance: 30_000, driver_identity_key: 'two', passenger_identity_key: 'one' },
    ],
    meta: [],
  },
  {
    incentive: [190, 200, 200],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 590,
      },
    ],
  },
);

test(
  'should work with global limits',
  process,
  {
    policy: { handler: Handler.id, max_amount: 70_000_00 },
    carpool: [{ distance: 5_000, driver_identity_key: 'one' }],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 69_999_00,
      },
    ],
  },
  {
    incentive: [100],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 70_000_00,
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
      { distance: 5_000, driver_identity_key: 'one', passenger_identity_key: 'one' },
      { distance: 5_000, driver_identity_key: 'one', passenger_identity_key: 'two' },
      { distance: 5_000, driver_identity_key: 'one', passenger_identity_key: 'three' },
      { distance: 5_000, driver_identity_key: 'one', passenger_identity_key: 'four' },
      { distance: 5_000, driver_identity_key: 'one', passenger_identity_key: 'five' },
      { distance: 5_000, driver_identity_key: 'one', passenger_identity_key: 'six' },
      { distance: 5_000, driver_identity_key: 'one', passenger_identity_key: 'seven' },
    ],
    meta: [],
  },
  {
    incentive: [190, 190, 190, 190, 190, 190, 0],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 1140,
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
      { distance: 5_000, driver_identity_key: 'one', passenger_identity_key: 'one' },
      { distance: 5_000, driver_identity_key: 'two', passenger_identity_key: 'one' },
      { distance: 5_000, driver_identity_key: 'three', passenger_identity_key: 'one' },
    ],
    meta: [],
  },
  {
    incentive: [190, 190, 0],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 380,
      },
    ],
  },
);
