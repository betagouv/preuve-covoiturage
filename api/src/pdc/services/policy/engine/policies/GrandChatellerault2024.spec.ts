import test from 'ava';
import { v4 } from 'uuid';
import { OperatorsEnum } from '../../interfaces';
import { makeProcessHelper } from '../tests/macro';
import { GrandChatellerault2024 as Handler } from './GrandChatellerault2024';

// Châtellerault
const defaultPosition = {
  arr: '86066',
  com: '86066',
  aom: '248600413',
  epci: '248600413',
  dep: '86',
  reg: '75',
  country: 'XXXXX',
};
const defaultLat = 46.81522088560449;
const defaultLon = 0.5471076683365941;

const defaultCarpool = {
  _id: 1,
  trip_id: v4(),
  passenger_identity_uuid: v4(),
  driver_identity_uuid: v4(),
  operator_siret: OperatorsEnum.Karos,
  operator_class: 'C',
  passenger_is_over_18: true,
  passenger_has_travel_pass: true,
  driver_has_travel_pass: true,
  datetime: new Date('2024-04-15'),
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
      { distance: 4_999 },
      { distance: 80_000 },
      { operator_class: 'A' },

      // // OD hors AOM
      { start: { ...defaultPosition, aom: '244900015' }, end: { ...defaultPosition, aom: '244900015' } },

      // O dans une AOM exclue
      { start: { ...defaultPosition, aom: '200069854' }, end: { ...defaultPosition, aom: '247200132' } },

      // D dans une AOM exclue
      { start: { ...defaultPosition, aom: '200071678' }, end: { ...defaultPosition, aom: '200069854' } },

      { passenger_is_over_18: false },
    ],
    meta: [],
  },
  { incentive: [0, 0, 0, 0, 0, 0, 0], meta: [] },
);

test(
  'should work basic',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 1_000, driver_identity_uuid: 'tom' },
      { distance: 5_000, driver_identity_uuid: 'tom' },
      { distance: 5_000, seats: 2, driver_identity_uuid: 'tom' },
      { distance: 5_000, driver_identity_uuid: 'nina', passenger_identity_uuid: 'marcel' },
      { distance: 80_000, driver_identity_uuid: 'nina', passenger_identity_uuid: 'marcel' },
    ],
    meta: [],
  },
  {
    incentive: [0, 150, 300, 150, 0],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 600,
      },
      {
        key: 'max_amount_restriction.0-tom.month.3-2024',
        value: 450,
      },
      {
        key: 'max_amount_restriction.0-nina.month.3-2024',
        value: 150,
      },
    ],
  },
);

test(
  'should work with global limits',
  process,
  {
    policy: { handler: Handler.id, max_amount: 2_200_000_00 },
    carpool: [{ distance: 5_000, driver_identity_uuid: 'one' }],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 2_199_998_50,
      },
    ],
  },
  {
    incentive: [150],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 2_200_000_00,
      },
      {
        key: 'max_amount_restriction.0-one.month.3-2024',
        value: 150,
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
      { distance: 5_000, driver_identity_uuid: 'one', passenger_identity_uuid: 'two' },
      { distance: 5_000, driver_identity_uuid: 'one', passenger_identity_uuid: 'two' },
      { distance: 5_000, driver_identity_uuid: 'one', passenger_identity_uuid: 'three' },
      { distance: 5_000, driver_identity_uuid: 'one', passenger_identity_uuid: 'three' },
      { distance: 5_000, driver_identity_uuid: 'one', passenger_identity_uuid: 'four' },
      { distance: 5_000, driver_identity_uuid: 'one', passenger_identity_uuid: 'four' },
      { distance: 5_000, driver_identity_uuid: 'one', passenger_identity_uuid: 'five' },
    ],
    meta: [],
  },
  {
    incentive: [150, 150, 150, 150, 150, 150, 0],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 900,
      },
      {
        key: 'max_amount_restriction.0-one.month.3-2024',
        value: 900,
      },
    ],
  },
);

test(
  'should work with driver month limits of 120,00 €',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 6_000, driver_identity_uuid: 'one' },
      { distance: 6_000, driver_identity_uuid: 'one' },
    ],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 0,
      },
      {
        key: 'max_amount_restriction.0-one.month.3-2024',
        value: 118_50,
      },
    ],
  },
  {
    incentive: [150, 0],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 150,
      },
      {
        key: 'max_amount_restriction.0-one.month.3-2024',
        value: 120_00,
      },
    ],
  },
);
