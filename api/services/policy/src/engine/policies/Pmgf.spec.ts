import test from 'ava';
import { v4 } from 'uuid';
import { OperatorsEnum } from '../../interfaces';
import { makeProcessHelper } from '../tests/macro';
import { Pmgf as Handler } from './Pmgf';

const defaultPosition = {
  arr: '74008',
  com: '74008',
  aom: '200011773',
  epci: '200011773',
  dep: '74',
  reg: '84',
  country: 'XXXXX',
  reseau: '10',
};

const defaultCarpool = {
  _id: 1,
  trip_id: v4(),
  passenger_identity_uuid: v4(),
  driver_identity_uuid: v4(),
  operator_siret: OperatorsEnum.BlaBlaDaily,
  operator_class: 'C',
  passenger_is_over_18: true,
  passenger_has_travel_pass: true,
  driver_has_travel_pass: true,
  datetime: new Date('2019-01-15'),
  seats: 1,
  duration: 600,
  distance: 5_000,
  cost: 20,
  start: { ...defaultPosition },
  end: { ...defaultPosition },
};

const process = makeProcessHelper(defaultCarpool);

test(
  'should works with exclusion',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [{ operator_siret: 'not in list' }, { distance: 100 }, { operator_class: 'A' }],
    meta: [],
  },
  { incentive: [0, 0, 0], meta: [] },
);

test(
  'should works basic with start/end inside aom',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 5_000, driver_identity_uuid: 'one' },
      { distance: 5_000, seats: 2, driver_identity_uuid: 'one' },
      { distance: 25_000, driver_identity_uuid: 'two' },
      { distance: 25_000, seats: 2, driver_identity_uuid: 'two' },
      { distance: 55_000, driver_identity_uuid: 'two' },
    ],
    meta: [],
  },
  {
    incentive: [200, 400, 250, 500, 400],
    meta: [
      {
        key: 'max_amount_restriction.0-one.month.0-2019',
        value: 600,
      },
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 1750,
      },
      {
        key: 'max_amount_restriction.0-two.month.0-2019',
        value: 1150,
      },
    ],
  },
);

test(
  'should works basic with start or end outside aom',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 5_000, driver_identity_uuid: 'one', start: { ...defaultPosition, arr: 'not_in_aom' } },
      { distance: 5_000, seats: 2, driver_identity_uuid: 'one', start: { ...defaultPosition, arr: 'not_in_aom' } },
      { distance: 25_000, driver_identity_uuid: 'two', start: { ...defaultPosition, arr: 'not_in_aom' } },
      { distance: 25_000, seats: 2, driver_identity_uuid: 'two', start: { ...defaultPosition, arr: 'not_in_aom' } },
      { distance: 55_000, driver_identity_uuid: 'two', start: { ...defaultPosition, arr: 'not_in_aom' } },
    ],
    meta: [],
  },
  {
    incentive: [100, 200, 150, 300, 300],
    meta: [
      {
        key: 'max_amount_restriction.0-one.month.0-2019',
        value: 300,
      },
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 1050,
      },
      {
        key: 'max_amount_restriction.0-two.month.0-2019',
        value: 750,
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
        value: 99_999_50,
      },
    ],
  },
  {
    incentive: [50],
    meta: [
      {
        key: 'max_amount_restriction.0-one.month.0-2019',
        value: 200,
      },
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 100_000_00,
      },
    ],
  },
);

test(
  'should works with month limits',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 5_000, driver_identity_uuid: 'one' },
      { distance: 5_000, driver_identity_uuid: 'one' },
      { distance: 5_000, driver_identity_uuid: 'one' },
      { distance: 5_000, driver_identity_uuid: 'one' },
    ],
    meta: [
      {
        key: 'max_amount_restriction.0-one.month.0-2019',
        value: 11500,
      },
    ],
  },
  {
    incentive: [200, 200, 100, 0],
    meta: [
      {
        key: 'max_amount_restriction.0-one.month.0-2019',
        value: 12000,
      },
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 500,
      },
    ],
  },
);
