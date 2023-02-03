import test from 'ava';
import { v4 } from 'uuid';
import { makeProcessHelper } from '../tests/macro';
import { Nm as Handler } from './Nm';

const defaultPosition = {
  arr: '44026',
  com: '44026',
  aom: '244400404',
  epci: '244400404',
  dep: '44',
  reg: '52',
  country: 'XXXXX',
  reseau: '67',
};

const defaultCarpool = {
  _id: 1,
  trip_id: v4(),
  passenger_identity_uuid: v4(),
  driver_identity_uuid: v4(),
  operator_siret: '75315323800047',
  operator_class: 'C',
  passenger_is_over_18: true,
  passenger_has_travel_pass: true,
  driver_has_travel_pass: true,
  datetime: new Date('2019-01-15'),
  seats: 1,
  duration: 2_000,
  distance: 19_000,
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
    carpool: [
      { operator_siret: 'not in list' },
      { distance: 100 },
      { start: { ...defaultPosition, aom: 'not_ok' } },
      { end: { ...defaultPosition, aom: 'not_ok' } },
      { operator_class: 'A' },
    ],
    meta: [],
  },
  { incentive: [0, 0, 0, 0, 0], meta: [] },
);

test(
  'should works basic',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 5_000, driver_identity_uuid: 'one', trip_id: '1' },
      { distance: 5_000, seats: 2, driver_identity_uuid: 'one', trip_id: '2' },
      { distance: 25_000, driver_identity_uuid: 'two', seats: 2, trip_id: '3' },
      { distance: 25_000, driver_identity_uuid: 'two', datetime: new Date('2022-03-28') },
    ],
    meta: [],
  },
  {
    incentive: [200, 400, 500, 250],
    meta: [
      {
        key: 'max_trip_restriction.global.campaign.global',
        value: 4,
      },
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 1350,
      },
    ],
  },
);

test(
  'should works with global amount limit',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [{ distance: 5_000, driver_identity_uuid: 'one' }],
    meta: [
      {
        key: 'max_trip_restriction.global.campaign.global',
        value: 2,
      },
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 9_999_999_50,
      },
    ],
  },
  {
    incentive: [50],
    meta: [
      {
        key: 'max_trip_restriction.global.campaign.global',
        value: 3,
      },
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 10_000_000_00,
      },
    ],
  },
);

test(
  'should works with global trip limit',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 5_000, driver_identity_uuid: 'one' },
      { distance: 5_000, driver_identity_uuid: 'one' },
    ],
    meta: [
      {
        key: 'max_trip_restriction.global.campaign.global',
        value: 9_999_999,
      },
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 50,
      },
    ],
  },
  {
    incentive: [200, 0],
    meta: [
      {
        key: 'max_trip_restriction.global.campaign.global',
        value: 10_000_000,
      },
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 250,
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
      { distance: 5_000, driver_identity_uuid: '11', passenger_identity_uuid: '21', trip_id: '1' },
      { distance: 5_000, driver_identity_uuid: '11', passenger_identity_uuid: '22', trip_id: '2' },
      { distance: 5_000, driver_identity_uuid: '11', passenger_identity_uuid: '23', trip_id: '3' },
      { distance: 5_000, driver_identity_uuid: '11', passenger_identity_uuid: '24', trip_id: '4' },
      { distance: 5_000, driver_identity_uuid: '11', passenger_identity_uuid: '25', trip_id: '5' },
      { distance: 5_000, driver_identity_uuid: '11', passenger_identity_uuid: '26', trip_id: '6' },
    ],
    meta: [],
  },
  {
    incentive: [200, 200, 200, 200, 0, 0],
    meta: [
      {
        key: 'max_trip_restriction.global.campaign.global',
        value: 4,
      },
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 800,
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
      { distance: 5_000, passenger_identity_uuid: '11', driver_identity_uuid: '21', trip_id: '1' },
      { distance: 5_000, passenger_identity_uuid: '11', driver_identity_uuid: '22', trip_id: '2' },
      { distance: 5_000, passenger_identity_uuid: '11', driver_identity_uuid: '23', trip_id: '3' },
      { distance: 5_000, passenger_identity_uuid: '11', driver_identity_uuid: '24', trip_id: '4' },
      { distance: 5_000, passenger_identity_uuid: '11', driver_identity_uuid: '25', trip_id: '5' },
      { distance: 5_000, passenger_identity_uuid: '11', driver_identity_uuid: '26', trip_id: '6' },
    ],
    meta: [],
  },
  {
    incentive: [200, 200, 200, 200, 0, 0],
    meta: [
      {
        key: 'max_trip_restriction.global.campaign.global',
        value: 4,
      },
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 800,
      },
    ],
  },
);

test(
  'should works with passenger trip limit',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 5_000, passenger_identity_uuid: '11', driver_identity_uuid: '21', trip_id: '1' },
      { distance: 5_000, passenger_identity_uuid: '12', driver_identity_uuid: '22', trip_id: '1', seats: 2 },
      { distance: 5_000, passenger_identity_uuid: '13', driver_identity_uuid: '23', trip_id: '1' },
      { distance: 5_000, passenger_identity_uuid: '14', driver_identity_uuid: '24', trip_id: '1' },
    ],
    meta: [],
  },
  {
    incentive: [200, 400, 0, 0],
    meta: [
      {
        key: 'max_trip_restriction.global.campaign.global',
        value: 2,
      },
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 600,
      },
    ],
  },
);
