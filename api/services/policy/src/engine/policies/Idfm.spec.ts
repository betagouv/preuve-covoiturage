import test from 'ava';
import { v4 } from 'uuid';
import { makeProcessHelper } from '../tests/macro';
import { Idfm as Handler } from './Idfm';

const defaultPosition = {
  arr: '91377',
  com: '91377',
  aom: '217500016',
  epci: '200056232',
  dep: '91',
  reg: '11',
  country: 'XXXXX',
  reseau: '232',
};

const defaultCarpool = {
  _id: 1,
  trip_id: v4(),
  identity_uuid: v4(),
  operator_siret: '80279897500024',
  operator_class: 'C',
  is_over_18: true,
  is_driver: true,
  has_travel_pass: true,
  datetime: new Date('2019-01-15'),
  seats: 1,
  duration: 600,
  distance: 5000,
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
    carpool: [
      { is_driver: false },
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
  { incentive: [0, 0, 0, 0, 0, 0, 0, 0, 0], meta: [] },
);

test(
  'should works basic',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 5000, identity_uuid: 'one' },
      { distance: 5000, seats: 2, identity_uuid: 'one' },
      { distance: 25000, identity_uuid: 'two' },
      { distance: 25000, identity_uuid: 'two', datetime: new Date('2022-03-28') },
    ],
    meta: [],
  },
  {
    incentive: [150, 300, 250, 375],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 1075,
      },
      {
        key: 'max_amount_restriction.one.month.0-2019',
        value: 450,
      },
      {
        key: 'max_amount_restriction.two.month.0-2019',
        value: 250,
      },
      {
        key: 'max_amount_restriction.two.month.2-2022',
        value: 375,
      },
    ],
  },
);

test(
  'should works with global limits',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [{ distance: 5000, identity_uuid: 'one' }],
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
    carpool: [{ distance: 5000, identity_uuid: 'one' }],
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
      { distance: 5000, identity_uuid: 'one' },
      { distance: 5000, identity_uuid: 'one' },
      { distance: 5000, identity_uuid: 'one' },
      { distance: 5000, identity_uuid: 'one' },
      { distance: 5000, identity_uuid: 'one' },
      { distance: 5000, identity_uuid: 'one' },
      { distance: 5000, identity_uuid: 'one' },
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