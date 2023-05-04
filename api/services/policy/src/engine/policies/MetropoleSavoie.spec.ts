import test from 'ava';
import { v4 } from 'uuid';
import { OperatorsEnum } from '../../interfaces';
import { makeProcessHelper } from '../tests/macro';
import { MetropoleSavoie as Handler } from './MetropoleSavoie';

const defaultPosition = {
  arr: '73031',
  com: '73031',
  aom: '200069110',
  epci: '200069110',
  dep: '73',
  reg: '84',
  country: 'XXXXX',
  reseau: '76',
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
  datetime: new Date('2023-01-02'),
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
  'should work basic',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 6_000 },
      { distance: 6_000, seats: 2 },
      { distance: 80_000 },
      { distance: 80_000, seats: 2 },
      {
        distance: 5_000,
        start: { aom: null, com: '73084', arr: '73084', epci: '200041010', reg: '84' },
      },
    ],
    meta: [],
  },
  {
    incentive: [200, 400, 800, 1600, 200],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 3200,
      },
    ],
  },
);

test(
  'should work with global limits',
  process,
  {
    policy: { handler: Handler.id, max_amount: 150_000_00 },
    carpool: [{ distance: 5_000, driver_identity_uuid: 'one' }],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 149_999_50,
      },
    ],
  },
  {
    incentive: [50],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 150_000_00,
      },
    ],
  },
);

test(
  'should work with exclusion',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      {
        distance: 25_000,
        operator_siret: OperatorsEnum.Klaxit,
      },
      {
        distance: 25_000,
        start: { aom: '200096956', com: '47091', arr: '47091', epci: '200096956', reg: '75' },
      },
    ],
    meta: [],
  },
  {
    incentive: [0, 0],
    meta: [],
  },
);
