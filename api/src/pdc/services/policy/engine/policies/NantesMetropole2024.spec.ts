import test from 'ava';
import { v4 } from 'uuid';
import { stub } from 'sinon';
import { OperatorsEnum } from '../../interfaces';
import { makeProcessHelper } from '../tests/macro';
import { NantesMetropole2024 as Handler } from './NantesMetropole2024';

const defaultPosition = {
  arr: '44109',
  com: '44109',
  aom: '244400404',
  epci: '244400404',
  dep: '44',
  reg: '52',
  country: 'XXXXX',
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

// Stub the mode method to control the booster date in tests
const boosterDates: string[] = ['2024-04-16'];
stub(Handler, 'mode').callsFake((date: Date, regular: any, booster: any) => {
  const ymd = date.toISOString().slice(0, 10);
  return boosterDates.includes(ymd) ? booster : regular;
});

test(
  'should work with exclusion',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 4_999 },
      { distance: 60_001 },
      { operator_class: 'A' },

      // // OD hors AOM
      { start: { ...defaultPosition, aom: '244900015' }, end: { ...defaultPosition, aom: '244900015' } },

      // O dans l'AOM et D hors AOM
      { start: { ...defaultPosition, aom: '244400404' }, end: { ...defaultPosition, aom: '247200132' } },

      // O hors AOM et D dans l'AOM
      { start: { ...defaultPosition, aom: '200071678' }, end: { ...defaultPosition, aom: '244400404' } },

      // // Région Île-de-France
      { start: { ...defaultPosition, reg: '11' } },
      { end: { ...defaultPosition, reg: '11' } },
      { passenger_is_over_18: false },
    ],
    meta: [],
  },
  { incentive: [0, 0, 0, 0, 0, 0, 0, 0, 0], meta: [] },
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
        key: 'max_amount_restriction.0-one.year.2024',
        value: 225,
      },
      {
        key: 'max_amount_restriction.0-two.month.3-2024',
        value: 460,
      },
      {
        key: 'max_amount_restriction.0-two.year.2024',
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
      {
        key: 'max_amount_restriction.0-one.year.2024',
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
      {
        key: 'max_amount_restriction.0-one.year.2024',
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
        key: 'max_amount_restriction.global.campaign.global',
        value: 100_00,
      },
      {
        key: 'max_amount_restriction.0-one.month.3-2024',
        value: 83_25,
      },
      {
        key: 'max_amount_restriction.0-one.year.2024',
        value: 83_25,
      },
    ],
  },
  {
    incentive: [75, 0],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 100_75,
      },
      {
        key: 'max_amount_restriction.0-one.month.3-2024',
        value: 84_00,
      },
      {
        key: 'max_amount_restriction.0-one.year.2024',
        value: 84_75,
      },
    ],
  },
);

test(
  'should work with driver year limits of 1008.00 €',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 6_000, driver_identity_key: 'one' },
      { distance: 6_000, driver_identity_key: 'one' },
    ],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 100_00,
      },
      {
        key: 'max_amount_restriction.0-one.month.3-2024',
        value: 0,
      },
      {
        key: 'max_amount_restriction.0-one.year.2024',
        value: 1007_25,
      },
    ],
  },
  {
    incentive: [75, 0],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 100_75,
      },
      {
        key: 'max_amount_restriction.0-one.month.3-2024',
        value: 75,
      },
      {
        key: 'max_amount_restriction.0-one.year.2024',
        value: 1008_00,
      },
    ],
  },
);

test(
  'should use boosterSlices on booster dates',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 6_000, driver_identity_key: 'reg', datetime: new Date('2024-04-15') },
      { distance: 6_000, driver_identity_key: 'boo', datetime: new Date('2024-04-16') },
      { distance: 11_000, driver_identity_key: 'reg', datetime: new Date('2024-04-15') },
      { distance: 11_000, driver_identity_key: 'boo', datetime: new Date('2024-04-16') },
      { distance: 17_000, driver_identity_key: 'reg', datetime: new Date('2024-04-15') },
      { distance: 17_000, driver_identity_key: 'boo', datetime: new Date('2024-04-16') },
      { distance: 30_000, driver_identity_key: 'reg', datetime: new Date('2024-04-15') },
      { distance: 30_000, driver_identity_key: 'boo', datetime: new Date('2024-04-16') },
      { distance: 75_000, driver_identity_key: 'reg', datetime: new Date('2024-04-15') },
      { distance: 75_000, driver_identity_key: 'boo', datetime: new Date('2024-04-16') },
    ],
  },
  {
    incentive: [75, 165, 75, 165, 75, 165, 200, 290, 0, 0],
  },
);
