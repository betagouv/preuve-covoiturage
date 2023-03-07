import test from 'ava';
import { v4 } from 'uuid';
import { OperatorsEnum } from '../../interfaces';
import { makeProcessHelper } from '../tests/macro';
import { Pdll2023 as Handler } from './Pdll2023';

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
  datetime: new Date('2023-04-15'),
  seats: 1,
  duration: 600,
  distance: 5_000,
  cost: 20,
  driver_payment: 20,
  passenger_payment: 20,
  start: { ...defaultPosition },
  end: { ...defaultPosition },
};

const process = makeProcessHelper(defaultCarpool);

test(
  'should work with exclusion',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 100 },
      { operator_class: 'A' },
      { start: { ...defaultPosition, aom: '244900015' }, end: { ...defaultPosition, aom: '244900015' } },
      { start: { ...defaultPosition, aom: '244400404' }, end: { ...defaultPosition, aom: '244400404' } },
      { start: { ...defaultPosition, aom: '247200132' }, end: { ...defaultPosition, aom: '247200132' } },
      { start: { ...defaultPosition, aom: '200071678' }, end: { ...defaultPosition, aom: '200071678' } },
      { start: { ...defaultPosition, reg: '11' } },
      { end: { ...defaultPosition, reg: '11' } },
      { distance: 90_000 },
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
      { distance: 1_000, driver_identity_uuid: 'one' },
      { distance: 5_000, driver_identity_uuid: 'one' },
      { distance: 5_000, seats: 2, driver_identity_uuid: 'one' },
      { distance: 20_000, driver_identity_uuid: 'two' },
      { distance: 25_000, driver_identity_uuid: 'two' },
      { distance: 25_000, driver_identity_uuid: 'two', datetime: new Date('2022-03-28') },
      { distance: 40_000, driver_identity_uuid: 'two' },
      { distance: 55_000, driver_identity_uuid: 'two' },
      { distance: 80_000, driver_identity_uuid: 'two' },
      { distance: 90_000, driver_identity_uuid: 'two' },
    ],
    meta: [],
  },
  {
    incentive: [0, 100, 200, 100, 150, 150, 300, 300, 300, 0],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 1600,
      },
    ],
  },
);

test(
  'should work with global limits',
  process,
  {
    policy: { handler: Handler.id, max_amount: 500_000_00 },
    carpool: [{ distance: 5_000, driver_identity_uuid: 'one' }],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 499_999_50,
      },
    ],
  },
  {
    incentive: [50],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 500_000_00,
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
      { distance: 5_000, driver_identity_uuid: 'one' },
      { distance: 5_000, driver_identity_uuid: 'one' },
      { distance: 5_000, driver_identity_uuid: 'one' },
      { distance: 5_000, driver_identity_uuid: 'one' },
      { distance: 5_000, driver_identity_uuid: 'one' },
      { distance: 5_000, driver_identity_uuid: 'one' },
      { distance: 5_000, driver_identity_uuid: 'one' },
    ],
    meta: [],
  },
  {
    incentive: [100, 100, 100, 100, 100, 100, 0],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 600,
      },
    ],
  },
);
