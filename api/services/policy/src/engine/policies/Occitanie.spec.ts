import test from 'ava';
import { v4 } from 'uuid';
import { CarpoolInterface, OperatorsEnum } from '../../interfaces';
import { makeProcessHelper } from '../tests/macro';
import { Occitanie as Handler } from './Occitanie';

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

const defaultCarpool: CarpoolInterface = {
  _id: 1,
  trip_id: v4(),
  passenger_identity_uuid: v4(),
  driver_identity_uuid: v4(),
  operator_siret: OperatorsEnum.BlaBlaDaily,
  operator_class: 'C',
  passenger_is_over_18: true,
  passenger_has_travel_pass: true,
  driver_has_travel_pass: true,
  datetime: new Date('2022-11-15'),
  seats: 1,
  duration: 600,
  distance: 5_000,
  cost: 20,
  start: { ...defaultPosition },
  end: { ...defaultPosition },
  driver_meta: {},
  driver_payment: 20,
  passenger_payment: 20,
  passenger_meta: {
    payments: [{ siret: OperatorsEnum.BlaBlaDaily, type: 'payment', amount: 10 }],
  },
};

const process = makeProcessHelper(defaultCarpool);

test(
  'should works with exclusion',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 40_000 }, // distance
      { operator_class: 'A' }, // operator_class
      { operator_siret: 'not_a_real_operator' }, // operator
      { datetime: new Date('2022-11-06') }, // not on sunday
      { datetime: new Date('2022-11-07') }, // works on other day
      { start: { ...defaultPosition, reg: 'not_in_region' } }, // starts/end in region only
      // but not inside same aom if not region
      { start: { ...defaultPosition, aom: 'aom1' }, end: { ...defaultPosition, aom: 'aom1' } },
      { start: { ...defaultPosition, aom: 'aom1' }, end: { ...defaultPosition, aom: 'aom2' } },
      { passenger_meta: undefined },
      { passenger_meta: undefined, datetime: new Date('2022-10-28') },
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
  'should works basic',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 5_000, driver_identity_uuid: 'one' },
      { distance: 25_000, driver_identity_uuid: 'two' },
    ],
    meta: [],
  },
  {
    incentive: [190, 200],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 390,
      },
    ],
  },
);

test(
  'should works with global limits',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [{ distance: 5_000, driver_identity_uuid: 'one' }],
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
  'should works with driver day limits',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 5_000, driver_identity_uuid: 'one', passenger_identity_uuid: 'one' },
      { distance: 5_000, driver_identity_uuid: 'one', passenger_identity_uuid: 'two' },
      { distance: 5_000, driver_identity_uuid: 'one', passenger_identity_uuid: 'three' },
      { distance: 5_000, driver_identity_uuid: 'one', passenger_identity_uuid: 'four' },
      { distance: 5_000, driver_identity_uuid: 'one', passenger_identity_uuid: 'five' },
      { distance: 5_000, driver_identity_uuid: 'one', passenger_identity_uuid: 'six' },
      { distance: 5_000, driver_identity_uuid: 'one', passenger_identity_uuid: 'seven' },
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
  'should works with passenger day limits',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 5_000, driver_identity_uuid: 'one', passenger_identity_uuid: 'one' },
      { distance: 5_000, driver_identity_uuid: 'two', passenger_identity_uuid: 'one' },
      { distance: 5_000, driver_identity_uuid: 'three', passenger_identity_uuid: 'one' },
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
