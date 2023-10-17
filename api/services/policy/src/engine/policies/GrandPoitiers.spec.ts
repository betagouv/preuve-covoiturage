import test from 'ava';
import { v4 } from 'uuid';
import { OperatorsEnum } from '../../interfaces';
import { makeProcessHelper } from '../tests/macro';
import { GrandPoitiers as Handler } from './GrandPoitiers';
import { generatePartialCarpools } from '../tests/helpers';

const defaultPosition = {
  arr: '74278',
  com: '74278',
  aom: '200033116',
  epci: '200033116',
  dep: '74',
  reg: '84',
  country: 'XXXXX',
  reseau: '142',
};

const defaultCarpool = {
  _id: 1,
  trip_id: v4(),
  passenger_identity_uuid: v4(),
  driver_identity_uuid: v4(),
  operator_siret: OperatorsEnum.Klaxit,
  operator_class: 'C',
  passenger_is_over_18: true,
  passenger_has_travel_pass: true,
  driver_has_travel_pass: true,
  datetime: new Date('2023-11-15'),
  seats: 1,
  duration: 600,
  distance: 7_000,
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
      { operator_class: 'B' },
      { distance: 81_000 },
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
      { distance: 79_999, seats: 2, driver_identity_uuid: 'one', passenger_identity_uuid: 'three' },
    ],
    meta: [],
  },
  {
    incentive: [150, 300],
    meta: [
      {
        key: 'max_amount_restriction.0-one.month.10-2023',
        value: 450,
      },
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 450,
      },
    ],
  },
);

test(
  'should work with driver month limits',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 6_000, driver_identity_uuid: 'one' },
      { distance: 6_000, driver_identity_uuid: 'one' },
    ],
    meta: [
      {
        key: 'max_amount_restriction.0-one.month.10-2023',
        value: 119_00,
      },
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 119_00,
      },
    ],
  },
  {
    incentive: [100, 0],
    meta: [
      {
        key: 'max_amount_restriction.0-one.month.10-2023',
        value: 120_00,
      },
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 120_00,
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
      { distance: 6_000, driver_identity_uuid: '11', passenger_identity_uuid: '21', trip_id: '1' },
      { distance: 6_000, driver_identity_uuid: '11', passenger_identity_uuid: '22', trip_id: '2' },
      { distance: 6_000, driver_identity_uuid: '11', passenger_identity_uuid: '23', trip_id: '3' },
      { distance: 6_000, driver_identity_uuid: '11', passenger_identity_uuid: '24', trip_id: '4' },
      { distance: 6_000, driver_identity_uuid: '11', passenger_identity_uuid: '25', trip_id: '5' },
      { distance: 6_000, driver_identity_uuid: '11', passenger_identity_uuid: '26', trip_id: '6' },
      { distance: 6_000, driver_identity_uuid: '11', passenger_identity_uuid: '26', trip_id: '6' },
    ],
    meta: [],
  },
  {
    incentive: [150, 150, 150, 150, 150, 150, 0],
    meta: [
      {
        key: 'max_amount_restriction.0-11.month.10-2023',
        value: 900,
      },
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 900,
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
      { distance: 6_000, driver_identity_uuid: '11', passenger_identity_uuid: '21', trip_id: '1' },
      { distance: 6_000, driver_identity_uuid: '11', passenger_identity_uuid: '21', trip_id: '2' },
      { distance: 6_000, driver_identity_uuid: '11', passenger_identity_uuid: '21', trip_id: '3' },
    ],
    meta: [],
  },
  {
    incentive: [150, 150, 0],
    meta: [
      {
        key: 'max_amount_restriction.0-11.month.10-2023',
        value: 300,
      },
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 300,
      },
    ],
  },
);

test(
  'should work with driver amount month limits',
  process,
  {
    policy: { handler: Handler.id },
    carpool: generatePartialCarpools(80),
    meta: [],
  },
  {
    incentive: [...[...Array(80).keys()].map(() => 150), 0],
    meta: [
      {
        key: 'max_amount_restriction.0-three.month.0-2022',
        value: 120_00,
      },
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 120_00,
      },
    ],
  },
);
