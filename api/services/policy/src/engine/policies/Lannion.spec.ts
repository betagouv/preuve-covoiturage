import test from 'ava';
import { v4 } from 'uuid';
import { OperatorsEnum } from '../../interfaces';
import { makeProcessHelper } from '../tests/macro';
import { Lannion as Handler } from './Lannion';

const defaultPosition = {
  arr: '22113',
  com: '22113',
  aom: '200065928',
  epci: '200065928',
  dep: '22',
  reg: '53',
  country: 'XXXXX',
  reseau: '194',
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
  datetime: new Date('2019-01-15'),
  seats: 1,
  duration: 2_000,
  distance: 19_000,
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
    incentive: [220, 420, 520, 270],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 1430,
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
        value: 60_684_00,
      },
    ],
  },
  {
    incentive: [87],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 60_684_87,
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
      { distance: 5_000, driver_identity_uuid: '11', passenger_identity_uuid: '26', trip_id: '6' },
      { distance: 5_000, driver_identity_uuid: '11', passenger_identity_uuid: '26', trip_id: '6' },
    ],
    meta: [],
  },
  {
    incentive: [220, 220, 220, 220, 220, 220, 0, 0],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 1320,
      },
    ],
  },
);
