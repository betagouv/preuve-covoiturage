import test from 'ava';
import { v4 } from 'uuid';
import { OperatorsEnum } from '../../interfaces';
import { makeProcessHelper } from '../tests/macro';
import { PaysBasque as Handler } from './PaysBasque';

const defaultPosition = {
  arr: '64155',
  com: '64155',
  aom: '256401605',
  epci: '200067106',
  dep: '64',
  reg: '75',
  country: 'XXXXX',
  reseau: '15',
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
  datetime: new Date('2023-04-15'),
  seats: 1,
  duration: 600,
  distance: 6_000,
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
      {
        start: {
          arr: '37109',
          com: '37109',
          aom: '200085108',
          epci: '243700754',
          reg: '24',
        },
        end: {
          arr: '37109',
          com: '37109',
          aom: '200085108',
          epci: '243700754',
          reg: '24',
        },
      },
      { passenger_is_over_18: false },
      { distance: 90_000, datetime: new Date('2024-01-01') },
    ],
    meta: [],
  },
  { incentive: [0, 0, 0, 0, 0, 0], meta: [] },
);

test(
  'should work basic',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 5_000, driver_identity_uuid: 'one' },
      { distance: 5_000, seats: 2, driver_identity_uuid: 'one' },
      { distance: 25_000, driver_identity_uuid: 'one' },
      { distance: 25_000, seats: 2, driver_identity_uuid: 'one' },
      {
        distance: 35_000,
        driver_identity_uuid: 'one',
      },
      { distance: 90_000, datetime: new Date('2023-12-31'), driver_identity_uuid: 'one' },
      { distance: 80_000, driver_identity_uuid: 'one' },
    ],
    meta: [],
  },
  {
    incentive: [200, 400, 250, 500, 300, 300, 300],
    meta: [
      {
        key: 'max_amount_restriction.0-one.month.3-2023',
        value: 1950,
      },
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 2250,
      },
      {
        key: 'max_amount_restriction.0-one.month.11-2023',
        value: 300,
      },
    ],
  },
);

test(
  'should work with global limits',
  process,
  {
    policy: { handler: Handler.id, max_amount: 60_000_00 },
    carpool: [{ distance: 5_000, driver_identity_uuid: 'one' }],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 49_998_00,
      },
    ],
  },
  {
    incentive: [200],
    meta: [
      {
        key: 'max_amount_restriction.0-one.month.3-2023',
        value: 200,
      },
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 50_000_00,
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
    incentive: [200, 200, 200, 200, 200, 200, 0],
    meta: [
      {
        key: 'max_amount_restriction.0-one.month.3-2023',
        value: 1200,
      },
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 12_00,
      },
    ],
  },
);
