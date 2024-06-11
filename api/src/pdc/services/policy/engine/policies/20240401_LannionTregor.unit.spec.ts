import test from 'ava';
import { v4 } from 'uuid';
import { CarpoolInterface, OperatorsEnum } from '../../interfaces';
import { makeProcessHelper } from '../tests/macro';
import { LannionTregor2024 as Handler } from './20240401_LannionTregor';

// Perros-Guirec
const defaultPosition = {
  arr: '22168',
  com: '22168',
  aom: '200065928',
  epci: '200065928',
  dep: '22',
  reg: '53',
  country: 'XXXXX',
  reseau: '194',
};

const defaultLat = 48.81387693883991;
const defaultLon = -3.4424441671291306;

const defaultCarpool: CarpoolInterface = {
  passenger_contribution: 150,
  passenger_identity_key: v4(),
  passenger_has_travel_pass: true,
  passenger_is_over_18: true,
  driver_revenue: 150,
  driver_identity_key: v4(),
  driver_has_travel_pass: true,
  operator_journey_id: v4(),
  operator_id: 9,
  operator_trip_id: v4(),
  operator_uuid: OperatorsEnum.BLABLACAR_DAILY,
  operator_class: 'C',
  datetime: new Date('2024-04-15'),
  seats: 1,
  distance: 5_000,
  start: { ...defaultPosition },
  start_lat: defaultLat,
  start_lon: defaultLon,
  end: { ...defaultPosition },
  end_lat: defaultLat,
  end_lon: defaultLon,
};

const process = makeProcessHelper(defaultCarpool);

test(
  'should work with exclusions',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { operator_uuid: 'not in list' },
      { distance: 100 },
      { operator_class: 'A' },
      {
        start: {
          ...defaultPosition,
          epci: '200070852', // Usses et Rhône
          aom: '200070852',
        },
        end: {
          ...defaultPosition,
          epci: '200070852',
          aom: '200070852',
        },
        datetime: new Date('2024-04-15'),
      },
      {
        start: {
          ...defaultPosition,
          epci: '247400047', // CC Vallée Verte
          aom: '247400047',
        },
        end: {
          ...defaultPosition,
          epci: '247400047',
          aom: '247400047',
        },
        datetime: new Date('2024-04-15'),
      },
      {
        end: {
          ...defaultPosition,
          aom: '247000623', // CC Quatre Rivière
        },
        start: {
          ...defaultPosition,
          aom: '247000623',
        },
        datetime: new Date('2024-04-15'),
      },
    ],
  },
  { incentive: [0, 0, 0, 0, 0, 0] },
);

test(
  'validate calculations',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 5_000, driver_identity_key: 'one' },
      { distance: 5_000, driver_identity_key: 'one', seats: 2 },
      { distance: 20_000, driver_identity_key: 'one', passenger_identity_key: 'two' },
      { distance: 29_000, driver_identity_key: 'one', passenger_identity_key: 'two' },
      { distance: 30_000, driver_identity_key: 'one', passenger_identity_key: 'three' },
      { distance: 40_000, driver_identity_key: 'one', passenger_identity_key: 'three', seats: 2 },
      { distance: 80_000, driver_identity_key: 'one' },
    ],
  },
  { incentive: [150, 300, 150, 240, 250, 500, 0] },
);

test(
  'should work with driver month limits',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 5_000, driver_identity_key: 'one' },
      { distance: 5_000, driver_identity_key: 'one' },
    ],
    meta: [
      {
        key: 'max_amount_restriction.0-one.month.3-2024',
        value: 148_50,
      },
    ],
  },
  {
    incentive: [150, 0],
    meta: [
      {
        key: 'max_amount_restriction.0-one.month.3-2024',
        value: 150_00,
      },
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 150,
      },
    ],
  },
);

test(
  'should work with driver daily limits',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 5_000, driver_identity_key: 'one' },
      { distance: 5_000, driver_identity_key: 'one' },
      { distance: 5_000, driver_identity_key: 'one' },
      { distance: 5_000, driver_identity_key: 'one' },
      { distance: 5_000, driver_identity_key: 'one' },
      { distance: 5_000, driver_identity_key: 'one' },
      { distance: 5_000, driver_identity_key: 'one' },
    ],
    meta: [
      {
        key: 'max_amount_restriction.0-one.month.3-2024',
        value: 0,
      },
    ],
  },
  {
    incentive: [150, 150, 150, 150, 150, 150, 0],
    meta: [
      {
        key: 'max_amount_restriction.0-one.month.3-2024',
        value: 900,
      },
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 900,
      },
    ],
  },
);
