import test from 'ava';
import { v4 } from 'uuid';
import { OperatorsEnum } from '../../interfaces';
import { makeProcessHelper } from '../tests/macro';
import { Vitre as Handler } from './Vitre';

const defaultPosition = {
  arr: '35360',
  com: '35360',
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
  'should works basic',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 5_000, driver_identity_uuid: 'one' },
      { distance: 5_000, seats: 2, driver_identity_uuid: 'one' },
      { distance: 25_000, driver_identity_uuid: 'one', passenger_identity_uuid: 'two' },
      { distance: 40_000, seats: 2, driver_identity_uuid: 'one', passenger_identity_uuid: 'three' },
    ],
    meta: [],
  },
  {
    incentive: [150, 300, 250, 600],
    meta: [
      {
        key: 'max_amount_restriction.0-one.month.3-2023',
        value: 1300,
      },
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 1300,
      },
    ],
  },
);

test(
  'should works with global limits',
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
  'should works with number day driver limit',
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
  'should works with number day passenger limit',
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
