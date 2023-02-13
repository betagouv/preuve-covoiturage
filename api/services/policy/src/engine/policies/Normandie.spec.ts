import test from 'ava';
import { v4 } from 'uuid';
import { CarpoolInterface } from '../../shared/policy/common/interfaces/CarpoolInterface';
import { OperatorsEnum } from '../../shared/policy/common/interfaces/OperatorsEnum';
import { makeProcessHelper } from '../tests/macro';
import { Normandie as Handler } from './Normandie';

const defaultPosition = {
  arr: '14047',
  com: '14047',
  aom: '200069516',
  epci: '200069516',
  dep: '28',
  reg: '28',
  country: 'XXXXX',
  reseau: '303',
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
  distance: 10_000,
  cost: 20,
  start: { ...defaultPosition },
  end: { ...defaultPosition },
  driver_meta: {},
  driver_payment: 10,
  passenger_payment: 10,
  passenger_meta: {
    payments: [{ siret: OperatorsEnum.BlaBlaDaily, type: 'payment', amount: 10 }],
  },
};

const process = makeProcessHelper(defaultCarpool);

test(
  'should work with exclusion',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { operator_class: 'A' }, // operator_class
      { start: { ...defaultPosition, reg: '25' } }, // starts/end in region only
      { start: { ...defaultPosition, epci: 'epci1' }, end: { ...defaultPosition, epci: 'epci1' } },
    ],
    meta: [],
  },
  {
    incentive: [0, 0, 0],
    meta: [],
  },
);

test.only(
  'should work basic',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 5_000 },
      { distance: 25_000 },
      {
        distance: 25_000,
        passenger_identity_uuid: 'one',
        start: {
          ...defaultPosition,
          com: '14047',
          epci: '241400555',
          aom: '200022358',
        },
        end: {
          ...defaultPosition,
          com: '27617',
          epci: '200071843',
        },
      },
    ],
    meta: [],
  },
  {
    incentive: [100, 100, 100],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 300,
      },
    ],
  },
);

test(
  'should work with global limits',
  process,
  {
    policy: { handler: Handler.id, max_amount: 70_000_00 },
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
  'should work with driver day limits',
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
    incentive: [100, 100, 100, 100, 100, 100, 0],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 600,
      },
    ],
  },
);

test(
  'should work with passenger day limits',
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
    incentive: [100, 100, 0],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 200,
      },
    ],
  },
);
