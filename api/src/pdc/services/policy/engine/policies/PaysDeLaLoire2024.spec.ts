import test from 'ava';
import { v4 } from 'uuid';
import { OperatorsEnum } from '../../interfaces';
import { makeProcessHelper } from '../tests/macro';
import { PaysDeLaLoire2024 as Handler } from './PaysDeLaLoire2024';

const defaultPosition = {
  arr: '85047',
  com: '85047',
  aom: '200071629',
  epci: '200071629',
  dep: '85',
  reg: '52',
  country: 'XXXXX',
  reseau: '430',
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
  datetime: new Date('2024-04-15'),
  seats: 1,
  duration: 600,
  distance: 5_000,
  cost: 20,
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
      { distance: 4999 },
      { operator_class: 'A' },

      // Nantes Métropole (244400404)
      { start: { ...defaultPosition, aom: '244400404' }, end: { ...defaultPosition, aom: '244400404' } },

      // Angers (244900015)
      { start: { ...defaultPosition, aom: '244900015' }, end: { ...defaultPosition, aom: '244900015' } },

      // Le Mans (247200132)
      { start: { ...defaultPosition, aom: '247200132' }, end: { ...defaultPosition, aom: '247200132' } },

      // CA Agglomération du Choletais (200071678)
      { start: { ...defaultPosition, aom: '200071678' }, end: { ...defaultPosition, aom: '200071678' } },

      // Région Île-de-France
      { start: { ...defaultPosition, reg: '11' } },
      { end: { ...defaultPosition, reg: '11' } },
      { distance: 60_001 },
      { passenger_is_over_18: false },
    ],
    meta: [],
  },
  { incentive: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], meta: [] },
);

test(
  'should work basic',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 1_000, driver_identity_key: 'one' },
      { distance: 5_000, driver_identity_key: 'one' },
      { distance: 5_000, seats: 2, driver_identity_key: 'one' },
      { distance: 20_000, driver_identity_key: 'two' },
      { distance: 25_000, driver_identity_key: 'two' },
      { distance: 55_000, driver_identity_key: 'two' },
      { distance: 61_000, driver_identity_key: 'two' },
    ],
    meta: [],
  },
  {
    incentive: [0, 75, 150, 105, 155, 200, 0],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 685,
      },
      {
        key: 'max_amount_restriction.0-one.month.3-2024',
        value: 225,
      },
      {
        key: 'max_amount_restriction.0-two.month.3-2024',
        value: 460,
      },
    ],
  },
);

test(
  'should work with global limits',
  process,
  {
    policy: { handler: Handler.id, max_amount: 2_200_000_00 },
    carpool: [{ distance: 5_000, driver_identity_key: 'one' }],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 2_199_999_25,
      },
    ],
  },
  {
    incentive: [75],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 2_200_000_00,
      },
      {
        key: 'max_amount_restriction.0-one.month.3-2024',
        value: 75,
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
    incentive: [75, 75, 75, 75, 75, 75, 0],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 450,
      },
      {
        key: 'max_amount_restriction.0-one.month.3-2024',
        value: 450,
      },
    ],
  },
);

test(
  'should work with driver month limits of 84 €',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 6_000, driver_identity_key: 'one' },
      { distance: 6_000, driver_identity_key: 'one' },
    ],
    meta: [
      {
        key: 'max_amount_restriction.0-one.month.3-2024',
        value: 83_25,
      },
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 83_25,
      },
    ],
  },
  {
    incentive: [75, 0],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 84_00,
      },
      {
        key: 'max_amount_restriction.0-one.month.3-2024',
        value: 84_00,
      },
    ],
  },
);
