import test from 'ava';
import { v4 } from 'uuid';
import { TerritoryCodeEnum } from '../../../interfaces';
import { makeProcessHelper } from '../../tests/macro';
import { PolicyTemplateOne as Handler } from './PolicyTemplateOne';

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

const defaultCarpool = {
  _id: 1,
  trip_id: v4(),
  passenger_identity_uuid: v4(),
  driver_identity_uuid: v4(),
  operator_siret: '80279897500024',
  operator_class: 'C',
  passenger_is_over_18: true,
  passenger_has_travel_pass: true,
  driver_has_travel_pass: true,
  datetime: new Date('2019-01-15'),
  seats: 1,
  duration: 600,
  distance: 5_000,
  cost: 20,
  start: { ...defaultPosition },
  end: { ...defaultPosition },
};

const process = makeProcessHelper(defaultCarpool);

test(
  'should works with exclusion',
  process,
  {
    policy: {
      handler: Handler.id,
      territory_selector: {
        [TerritoryCodeEnum.City]: ['80160'],
        [TerritoryCodeEnum.Mobility]: ['248000531'],
        [TerritoryCodeEnum.CityGroup]: ['248000531'],
      },
    },
    carpool: [{ distance: 100 }, { distance: 200_000 }, { operator_class: 'A' }],
    meta: [],
  },
  { incentive: [0, 0, 0], meta: [] },
);

test(
  'should works basic',
  process,
  {
    policy: {
      handler: Handler.id,
      territory_selector: {
        [TerritoryCodeEnum.Mobility]: ['217500016'],
        [TerritoryCodeEnum.CityGroup]: ['200056232'],
      },
    },
    carpool: [
      { distance: 5_000, driver_identity_uuid: 'one' },
      { distance: 5_000, seats: 2, driver_identity_uuid: 'one' },
      { distance: 25_000, driver_identity_uuid: 'two' },
      { distance: 55_000, driver_identity_uuid: 'three' },
      {
        distance: 50_000,
        driver_identity_uuid: 'four',
        start: { ...defaultPosition, [TerritoryCodeEnum.City]: '91666' },
        end: { ...defaultPosition, [TerritoryCodeEnum.City]: '77250' },
      },
      { start: { ...defaultPosition, [TerritoryCodeEnum.City]: '80160' } },
    ],
    meta: [],
  },
  {
    incentive: [200, 400, 250, 500, 500, 200],
    meta: [],
  },
);
