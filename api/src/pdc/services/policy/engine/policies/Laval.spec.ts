import test from 'ava';
import { v4 } from 'uuid';
import { OperatorsEnum } from '../../interfaces/index.ts';
import { makeProcessHelper } from '../tests/macro.ts';
import { Laval as Handler } from './Laval.ts';

const defaultPosition = {
  arr: '53130',
  com: '53130',
  aom: '200083392',
  epci: '200083392',
  dep: '53',
  reg: '52',
  country: 'XXXXX',
  reseau: '52',
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
  datetime: new Date('2019-01-15'),
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
    carpool: [{ operator_uuid: 'not in list' }, { distance: 100 }, { distance: 200_000 }, { operator_class: 'A' }],
    meta: [],
  },
  { incentive: [0, 0, 0, 0], meta: [] },
);

test(
  'should work basic',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 5_000, driver_identity_key: 'one' },
      { distance: 5_000, seats: 2, driver_identity_key: 'one' },
      { distance: 25_000, driver_identity_key: 'two' },
      { distance: 25_000, driver_identity_key: 'two', datetime: new Date('2022-03-28') },
    ],
    meta: [],
  },
  {
    incentive: [50, 100, 50, 50],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 250,
      },
    ],
  },
);

test(
  'should work with global limits',
  process,
  {
    policy: { handler: Handler.id, max_amount: 27_000_00 },
    carpool: [{ distance: 5_000, driver_identity_key: 'one' }],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 26_999_80,
      },
    ],
  },
  {
    incentive: [20],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 27_000_00,
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
      { distance: 5_000, driver_identity_key: 'one' },
      { distance: 5_000, driver_identity_key: 'one' },
      { distance: 5_000, driver_identity_key: 'one' },
      { distance: 5_000, driver_identity_key: 'one' },
      { distance: 5_000, driver_identity_key: 'one' },
      { distance: 5_000, driver_identity_key: 'one' },
      { distance: 5_000, driver_identity_key: 'one' },
    ],
    meta: [],
  },
  {
    incentive: [50, 50, 50, 50, 50, 50, 0],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 300,
      },
    ],
  },
);
