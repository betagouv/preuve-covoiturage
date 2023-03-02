import test from 'ava';
import { v4 } from 'uuid';
import { OperatorsEnum } from '../../interfaces';
import { makeProcessHelper } from '../tests/macro';
import { LaRochelle as Handler } from './LaRochelle';

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
  operator_siret: OperatorsEnum.Klaxit,
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
      { distance: 2_000 },
      { distance: 6_000 },
      { distance: 6_000, seats: 2 },
      { distance: 80_000 },
      { distance: 80_000, seats: 2 },
    ],
    meta: [],
  },
  {
    incentive: [150, 150, 300, 300, 600],
    meta: [
      {
        key: 'max_amount_restriction.global.campaign.global',
        value: 1500,
      },
    ],
  },
);
