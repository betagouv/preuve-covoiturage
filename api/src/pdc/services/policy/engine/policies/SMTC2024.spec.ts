import test from 'ava';
import { v4 } from 'uuid';
import { OperatorsEnum } from '../../interfaces';
import { makeProcessHelper } from '../tests/macro';
import { SMTC2024 as Handler } from './SMTC2024';

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
const defaultLat = 48.72565703413325;
const defaultLon = 2.261827843187402;

const defaultCarpool = {
  _id: 1,
  trip_id: v4(),
  passenger_identity_uuid: v4(),
  driver_identity_uuid: v4(),
  operator_uuid: OperatorsEnum.MOV_ICI,
  operator_class: 'C',
  passenger_is_over_18: true,
  passenger_has_travel_pass: true,
  driver_has_travel_pass: true,
  datetime: new Date('2024-05-15'),
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
      { operator_uuid: OperatorsEnum.MOBICOOP },
      { distance: 100 },
      { distance: 80_001 },
      { operator_class: 'A' },
    ],
    meta: [],
  },
  { incentive: [0, 0, 0, 0], meta: [] },
);

test(
  'should work basic',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 5_000, driver_identity_uuid: 'one' },
      { distance: 5_000, seats: 2, driver_identity_uuid: 'one' },
      { distance: 60_000, driver_identity_uuid: 'one' },
    ],
    meta: [],
  },
  {
    incentive: [150, 300, 150],
    meta: [
      {
        key: 'max_amount_restriction.0-one.month.4-2024',
        value: 600,
      },
      {
        key: 'max_amount_restriction.0-one.year.2024',
        value: 600,
      },
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 600,
      },
    ],
  },
);

test(
  'should work with driver month limits 90',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 5_000, driver_identity_uuid: 'one' },
      { distance: 5_000, driver_identity_uuid: 'one' },
    ],
    meta: [
      {
        key: 'max_amount_restriction.0-one.month.4-2024',
        value: 88_50,
      },
      {
        key: 'max_amount_restriction.0-one.year.2024',
        value: 88_50,
      },
    ],
  },
  {
    incentive: [150, 0],
    meta: [
      {
        key: 'max_amount_restriction.0-one.month.4-2024',
        value: 90_00,
      },
      // La limite à l'année est incrémentée de 1,50 €
      // mais la limite au mois prévaut, la 2ème incitation de 1,5€ ne sera pas attribuée
      {
        key: 'max_amount_restriction.0-one.year.2024',
        value: 91_50,
      },
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 150,
      },
    ],
  },
);

test(
  'should work with driver year limit 540',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 5_000, driver_identity_uuid: 'one' },
      { distance: 5_000, driver_identity_uuid: 'one' },
    ],
    meta: [
      {
        key: 'max_amount_restriction.0-one.year.2024',
        value: 538_50,
      },
    ],
  },
  {
    incentive: [150, 0],
    meta: [
      {
        key: 'max_amount_restriction.0-one.month.4-2024',
        value: 150,
      },
      {
        key: 'max_amount_restriction.0-one.year.2024',
        value: 540_00,
      },
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 150,
      },
    ],
  },
);
