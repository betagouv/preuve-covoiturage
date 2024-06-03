import test from 'ava';
import { v4 } from 'uuid';
import { OperatorsEnum } from '../../interfaces';
import { makeProcessHelper } from '../tests/macro';
import { LaRochelle20232024 as Handler } from './20230101_LaRochelle';

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
const defaultLat = 48.72565703413325;
const defaultLon = 2.261827843187402;

const defaultCarpool = {
  _id: 1,
  operator_trip_id: v4(),
  passenger_identity_key: v4(),
  driver_identity_key: 'driver_id_one',
  operator_uuid: OperatorsEnum.KLAXIT,
  operator_class: 'C',
  passenger_is_over_18: true,
  passenger_has_travel_pass: true,
  driver_has_travel_pass: true,
  datetime: new Date('2023-01-02'),
  seats: 1,
  distance: 6_000,
  operator_journey_id: v4(),
  operator_id: 1,
  driver_revenue: 20,
  passenger_contribution: 20,
  start: { ...defaultPosition },
  end: { ...defaultPosition },
  start_lat: defaultLat,
  start_lon: defaultLon,
  end_lat: defaultLat,
  end_lon: defaultLon,
};

const process = makeProcessHelper(defaultCarpool);

test(
  'should work basic',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 2_000 },
      { distance: 6_000 },
      { distance: 6_000, seats: 2 },
      { distance: 80_000 },
      { distance: 80_000, seats: 2 },
      { distance: 10_000, datetime: new Date('2023-06-01') },
      { distance: 17_000, datetime: new Date('2023-06-01') },
      { distance: 50_001, datetime: new Date('2023-06-01') },
      { distance: 70_001, datetime: new Date('2023-06-01') },
      { distance: 2_000, datetime: new Date('2023-06-01') },
    ],
    meta: [],
  },
  {
    incentive: [150, 150, 300, 300, 600, 100, 170, 200, 0, 0],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 1970,
      },
      {
        key: 'max_amount_restriction.0-driver_id_one.month.0-2023',
        value: 1500,
      },
      {
        key: 'max_amount_restriction.0-driver_id_one.month.5-2023',
        value: 470,
      },
    ],
  },
);

test(
  'should work with driver month limits of 80 €',
  process,
  {
    policy: { handler: Handler.id },
    carpool: [
      { distance: 6_000, datetime: new Date('2023-06-01') },
      { distance: 6_000, datetime: new Date('2023-06-01') },
    ],
    meta: [
      {
        key: 'max_amount_restriction.0-driver_id_one.month.5-2023',
        value: 79_00,
      },
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 79_00,
      },
    ],
  },
  {
    incentive: [100, 0],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 80_00,
      },
      {
        key: 'max_amount_restriction.0-driver_id_one.month.5-2023',
        value: 80_00,
      },
    ],
  },
);
