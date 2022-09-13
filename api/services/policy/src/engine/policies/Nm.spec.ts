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
  duration: 2000,
  distance: 19000,
  cost: 20,
  start: { ...defaultPosition },
  end: { ...defaultPosition },
};

const process = makeProcessHelper(defaultCarpool);

test(
  'should works exclusion',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { operator_siret: 'not in list' },
      { distance: 100 },
      { distance: 200000 },
      { start: { ...defaultPosition, com: '75056' }, end: { ...defaultPosition, com: '75056' } },
      { start: { ...defaultPosition, aom: 'not_ok' } },
      { end: { ...defaultPosition, aom: 'not_ok' } },
      { operator_class: 'A' },
      { operator_class: 'B', datetime: new Date('2022-09-02') },
    ],
    meta: [],
  },
  { incentive: [0, 0, 0, 0, 0, 0, 0, 0], meta: [] },
);

test.only(
  'should works basic',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 19000, driver_identity_uuid: 'one' },
      // { distance: 5000, seats: 2, driver_identity_uuid: 'one' },
      // { distance: 25000, driver_identity_uuid: 'two' },
      // { distance: 25000, driver_identity_uuid: 'two', datetime: new Date('2022-03-28') },
    ],
    meta: [],
  },
  {
    incentive: [200],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 200,
      },
      {
        key: 'max_trip_restriction.global.campaign.global',
        value: 1,
      },
      {
        key: 'max_amount_restriction.one.month.0-2019',
        value: 200,
      },
    ],
  },
);

test(
  'should works with global limits',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [{ distance: 5000, driver_identity_uuid: 'one' }],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 599999950,
      },
    ],
  },
  {
    incentive: [50],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 600000000,
      },
      {
        key: 'max_amount_restriction.one.month.0-2019',
        value: 50,
      },
    ],
  },
);

test(
  'should works with month limits',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [{ distance: 5000, driver_identity_uuid: 'one' }],
    meta: [
      {
        key: 'max_amount_restriction.one.month.0-2019',
        value: 14900,
      },
    ],
  },
  {
    incentive: [100],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 150,
      },
      {
        key: 'max_amount_restriction.one.month.0-2019',
        value: 15000,
      },
    ],
  },
);

test(
  'should works with day limits',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 5000, driver_identity_uuid: 'one' },
      { distance: 5000, driver_identity_uuid: 'one' },
      { distance: 5000, driver_identity_uuid: 'one' },
      { distance: 5000, driver_identity_uuid: 'one' },
      { distance: 5000, driver_identity_uuid: 'one' },
      { distance: 5000, driver_identity_uuid: 'one' },
      { distance: 5000, driver_identity_uuid: 'one' },
    ],
    meta: [],
  },
  {
    incentive: [150, 150, 150, 150, 150, 150, 0],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 1050,
      },
      {
        key: 'max_amount_restriction.one.month.0-2019',
        value: 1050,
      },
    ],
  },
);
