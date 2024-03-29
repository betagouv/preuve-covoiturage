import test from 'ava';
import { v4 } from 'uuid';
import { OperatorsEnum } from '../../interfaces';
import { makeProcessHelper } from '../tests/macro';
import { PetrLunevilloisS12023 as Handler } from './PetrLunevilloisS12023';

const defaultPosition = {
  arr: '54233',
  com: '54233',
  aom: '200051134',
  epci: '200069433',
  dep: '54',
  reg: '44',
  country: 'XXXXX',
  reseau: '269',
};
const defaultLat = 48.5905360901711;
const defaultLon = 6.499392987670189;

const defaultCarpool = {
  _id: 1,
  trip_id: v4(),
  passenger_identity_uuid: v4(),
  driver_identity_uuid: v4(),
  operator_siret: OperatorsEnum.Mobicoop,
  operator_class: 'C',
  passenger_is_over_18: true,
  passenger_has_travel_pass: true,
  driver_has_travel_pass: true,
  datetime: new Date('2023-02-01'),
  seats: 1,
  duration: 600,
  distance: 5_000,
  cost: 20,
  driver_payment: 20,
  passenger_payment: 20,
  start: { ...defaultPosition },
  end: { ...defaultPosition },
  start_lat: defaultLat,
  start_lon: defaultLon,
  end_lat: 48.58685290576798,
  end_lon: 6.483696700766759,
};

const process = makeProcessHelper(defaultCarpool);

test(
  'should work with exclusions',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { operator_siret: 'not in list' },
      { operator_siret: OperatorsEnum.Klaxit },
      { distance: 100 },
      { distance: 60_000 },
      { operator_class: 'A' },
    ],
    meta: [],
  },
  { incentive: [0, 0, 0, 0, 0], meta: [] },
);

test(
  'should work basic with start/end inside aom',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 5_000, driver_identity_uuid: 'one' },
      { distance: 5_000, seats: 2, driver_identity_uuid: 'one' },
      { distance: 25_000, driver_identity_uuid: 'two' },
      { distance: 25_000, seats: 2, driver_identity_uuid: 'two' },
    ],
    meta: [],
  },
  {
    incentive: [21, 42, 161, 322],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 546,
      },
    ],
  },
);

test(
  'should work basic with start or end outside aom',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      // start
      { distance: 5_000, driver_identity_uuid: 'one', start: { ...defaultPosition, aom: 'not_in_aom' } },
      { distance: 5_000, seats: 2, driver_identity_uuid: 'one', start: { ...defaultPosition, aom: 'not_in_aom' } },
      { distance: 25_000, driver_identity_uuid: 'two', start: { ...defaultPosition, aom: 'not_in_aom' } },
      { distance: 25_000, seats: 2, driver_identity_uuid: 'two', start: { ...defaultPosition, aom: 'not_in_aom' } },
      { distance: 55_000, driver_identity_uuid: 'two', start: { ...defaultPosition, aom: 'not_in_aom' } },

      // end
      { distance: 5_000, driver_identity_uuid: 'one', end: { ...defaultPosition, aom: 'not_in_aom' } },
      { distance: 5_000, seats: 2, driver_identity_uuid: 'one', end: { ...defaultPosition, aom: 'not_in_aom' } },
      { distance: 25_000, driver_identity_uuid: 'two', end: { ...defaultPosition, aom: 'not_in_aom' } },
      { distance: 25_000, seats: 2, driver_identity_uuid: 'two', end: { ...defaultPosition, aom: 'not_in_aom' } },
      { distance: 55_000, driver_identity_uuid: 'two', end: { ...defaultPosition, aom: 'not_in_aom' } },
    ],
    meta: [],
  },
  {
    incentive: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    meta: [],
  },
);

test(
  'should work with global limits',
  process,
  {
    policy: { handler: Handler.id, max_amount: 10_000_00 },
    carpool: [{ distance: 59_000, driver_identity_uuid: 'one' }],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 9_999_99,
      },
    ],
  },
  {
    incentive: [1], // <-- should be 413. capped to 1
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 10_000_00,
      },
    ],
  },
);

test(
  'should work with 2 trips per day limit',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 5_000, driver_identity_uuid: 'one' },
      { distance: 5_000, driver_identity_uuid: 'one' },
      { distance: 5_000, driver_identity_uuid: 'one' },
      { distance: 5_000, driver_identity_uuid: 'one' },
    ],
    meta: [],
  },
  {
    incentive: [21, 21, 0, 0],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 42,
      },
    ],
  },
);
