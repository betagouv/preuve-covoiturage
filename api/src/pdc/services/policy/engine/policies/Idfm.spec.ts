import test from 'ava';
import { v4 } from 'uuid';
import { OperatorsEnum } from '../../interfaces';
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
const defaultLat = 48.72565703413325;
const defaultLon = 2.261827843187402;

const defaultCarpool = {
  _id: 1,
  trip_id: v4(),
  passenger_identity_uuid: v4(),
  driver_identity_uuid: v4(),
  operator_uuid: OperatorsEnum.KAROS,
  operator_class: 'C',
  passenger_is_over_18: true,
  passenger_has_travel_pass: true,
  driver_has_travel_pass: true,
  datetime: new Date('2019-01-15'),
  seats: 1,
  duration: 600,
  distance: 5_000,
  cost: 20,
  driver_payment: 20,
  passenger_payment: 20,
  start: { ...defaultPosition },
  end: { ...defaultPosition },
  start_lat: defaultLat,
  start_lon: defaultLon,
  end_lat: defaultLat,
  end_lon: defaultLon,
};

const process = makeProcessHelper(defaultCarpool);

test(
  'should work with exclusion',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { operator_uuid: 'not in list' },
      { distance: 100 },
      { distance: 200_000 },
      { start: { ...defaultPosition, com: '75056' }, end: { ...defaultPosition, com: '75056' } },
      { start: { ...defaultPosition, aom: 'not_ok' } },
      { end: { ...defaultPosition, aom: 'not_ok' } },
      { operator_class: 'A' },
      { operator_class: 'B', datetime: new Date('2022-09-02') },
      { operator_uuid: OperatorsEnum.YNSTANT },
    ],
    meta: [],
  },
  { incentive: [0, 0, 0, 0, 0, 0, 0, 0, 0], meta: [] },
);

test(
  'should work basic',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 5_000, driver_identity_uuid: 'one' },
      { distance: 5_000, seats: 2, driver_identity_uuid: 'one' },
      { distance: 25_000, driver_identity_uuid: 'two' },
      { distance: 25_000, driver_identity_uuid: 'two', datetime: new Date('2022-03-28') },
      { distance: 55_000, driver_identity_uuid: 'three' },
      {
        distance: 5_000,
        operator_uuid: OperatorsEnum.YNSTANT,
        datetime: new Date('2023-03-22'),
        driver_identity_uuid: 'four',
      },
      {
        distance: 5_000,
        driver_identity_uuid: 'four',
        start: { ...defaultPosition, aom: '287500078' },
        end: { ...defaultPosition, aom: '287500078' },
      },
    ],
    meta: [],
  },
  {
    incentive: [150, 300, 250, 375, 300, 150, 150],
    meta: [
      {
        key: 'max_amount_restriction.0-one.month.0-2019',
        value: 450,
      },
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 1675,
      },
      {
        key: 'max_amount_restriction.0-two.month.0-2019',
        value: 250,
      },
      {
        key: 'max_amount_restriction.0-two.month.2-2022',
        value: 375,
      },
      {
        key: 'max_amount_restriction.0-three.month.0-2019',
        value: 300,
      },
      {
        key: 'max_amount_restriction.0-four.month.2-2023',
        value: 150,
      },
      {
        key: 'max_amount_restriction.0-four.month.0-2019',
        value: 150,
      },
    ],
  },
);

test(
  'strike days',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 23_920, driver_identity_uuid: '1', datetime: new Date('2023-02-07') },
      { distance: 31_664, driver_identity_uuid: '2', datetime: new Date('2023-02-07') },
      { distance: 43_373, driver_identity_uuid: '3', datetime: new Date('2023-02-07') },
      { distance: 13_799, driver_identity_uuid: '4', datetime: new Date('2023-02-07') },
      { distance: 6_306, driver_identity_uuid: '5', datetime: new Date('2023-02-07') },
    ],
    meta: [],
  },
  {
    incentive: [Math.ceil(239 * 1.5), 300 * 1.5, 300 * 1.5, 150 * 1.5, 150 * 1.5],
    meta: [
      {
        key: 'max_amount_restriction.0-1.month.1-2023',
        value: 359,
      },
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 1709,
      },
      {
        key: 'max_amount_restriction.0-2.month.1-2023',
        value: 450,
      },
      {
        key: 'max_amount_restriction.0-3.month.1-2023',
        value: 450,
      },
      {
        key: 'max_amount_restriction.0-4.month.1-2023',
        value: 225,
      },
      {
        key: 'max_amount_restriction.0-5.month.1-2023',
        value: 225,
      },
    ],
  },
);

test(
  'should work with global limits',
  process,
  {
    policy: { handler: Handler.id, max_amount: 10_300_000_00 },
    carpool: [{ distance: 5_000, driver_identity_uuid: 'one' }],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 10_299_999_50,
      },
    ],
  },
  {
    incentive: [50],
    meta: [
      {
        key: 'max_amount_restriction.0-one.month.0-2019',
        value: 150,
      },
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 10_300_000_00,
      },
    ],
  },
);

test(
  'should work with month limits',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [{ distance: 5_000, driver_identity_uuid: 'one' }],
    meta: [
      {
        key: 'max_amount_restriction.0-one.month.0-2019',
        value: 149_00,
      },
    ],
  },
  {
    incentive: [100],
    meta: [
      {
        key: 'max_amount_restriction.0-one.month.0-2019',
        value: 150_00,
      },
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 100,
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
    incentive: [150, 150, 150, 150, 150, 150, 0],
    meta: [
      {
        key: 'max_amount_restriction.0-one.month.0-2019',
        value: 900,
      },
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 900,
      },
    ],
  },
);
