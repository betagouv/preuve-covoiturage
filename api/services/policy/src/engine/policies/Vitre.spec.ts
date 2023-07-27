import test from 'ava';
import { v4 } from 'uuid';
import { OperatorsEnum } from '../../interfaces';
import { makeProcessHelper } from '../tests/macro';
import { Vitre as Handler } from './Vitre';

const defaultPosition = {
  arr: '35361',
  com: '35361',
  aom: '200039022',
  epci: '200039022',
  dep: '37',
  reg: '53',
  country: 'XXXXX',
  reseau: '96',
};

const defaultCarpool = {
  _id: 1,
  trip_id: v4(),
  passenger_identity_uuid: v4(),
  driver_identity_uuid: v4(),
  operator_siret: OperatorsEnum.Klaxit,
  operator_class: 'B',
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
      { operator_siret: 'not in list' },
      { distance: 100 },
      { operator_class: 'A' },
      { distance: 80_000, datetime: new Date('2023-07-18') },
      {
        start: {
          com: '35360',
          aom: '200039022',
          epci: '200039022',
          reg: '53',
          arr: '35360',
        },
        datetime: new Date('2023-07-18'),
      },
    ],
    meta: [],
  },
  { incentive: [0, 0, 0, 0, 0], meta: [] },
);

test(
  'should work basic',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 5_000, driver_identity_uuid: 'one' },
      { distance: 5_000, seats: 2, driver_identity_uuid: 'one' },
      {
        distance: 25_000,
        driver_identity_uuid: 'one',
        passenger_identity_uuid: 'two',
        start: {
          com: '35360',
          aom: '200039022',
          epci: '200039022',
          reg: '53',
          arr: '35360',
        },
        datetime: new Date('2023-07-01'),
      },
      {
        distance: 40_000,
        seats: 2,
        driver_identity_uuid: 'one',
        passenger_identity_uuid: 'three',
        datetime: new Date('2023-07-01'),
      },
      {
        distance: 25_000,
        driver_identity_uuid: 'one',
        passenger_identity_uuid: 'two',
        datetime: new Date('2023-07-20'),
      },
      {
        distance: 50_000,
        seats: 2,
        driver_identity_uuid: 'one',
        passenger_identity_uuid: 'three',
        datetime: new Date('2023-07-20'),
      },
    ],
    meta: [],
  },
  {
    incentive: [150, 300, 250, 600, 200, 400],
    meta: [
      {
        key: 'max_amount_restriction.0-one.month.3-2023',
        value: 450,
      },
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 1900,
      },
      {
        key: 'max_amount_restriction.0-one.month.6-2023',
        value: 1450,
      },
    ],
  },
);

test(
  'should work with global limits',
  process,
  {
    policy: { handler: Handler.id, max_amount: 180_000_00 },
    carpool: [{ distance: 5_000, driver_identity_uuid: 'one' }],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 179_999_50,
      },
    ],
  },
  {
    incentive: [50],
    meta: [
      {
        key: 'max_amount_restriction.0-one.month.3-2023',
        value: 150,
      },
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 180_000_00,
      },
    ],
  },
);

test(
  'should work with number day driver limit',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 5_000, driver_identity_uuid: 'one', passenger_identity_uuid: v4() },
      { distance: 5_000, driver_identity_uuid: 'one', passenger_identity_uuid: v4() },
      { distance: 5_000, driver_identity_uuid: 'one', passenger_identity_uuid: v4() },
      { distance: 5_000, driver_identity_uuid: 'one', passenger_identity_uuid: v4() },
      { distance: 5_000, driver_identity_uuid: 'one', passenger_identity_uuid: v4() },
      { distance: 5_000, driver_identity_uuid: 'one', passenger_identity_uuid: v4() },
      { distance: 5_000, driver_identity_uuid: 'one', passenger_identity_uuid: v4() },
    ],
    meta: [],
  },
  {
    incentive: [150, 150, 150, 150, 150, 150, 0],
    meta: [
      {
        key: 'max_amount_restriction.0-one.month.3-2023',
        value: 900,
      },
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 9_00,
      },
    ],
  },
);

test(
  'should work with number day passenger limit',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 5_000, driver_identity_uuid: 'one' },
      { distance: 5_000, driver_identity_uuid: 'one' },
      { distance: 5_000, driver_identity_uuid: 'one' },
    ],
    meta: [],
  },
  {
    incentive: [150, 150, 0],
    meta: [
      {
        key: 'max_amount_restriction.0-one.month.3-2023',
        value: 300,
      },
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 3_00,
      },
    ],
  },
);
