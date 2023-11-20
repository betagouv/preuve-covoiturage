import { v4 } from 'uuid';
import {
  CarpoolInterface,
  IncentiveStateEnum,
  IncentiveStatusEnum,
  SerializedIncentiveInterface,
} from '../../interfaces';

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

const dftCarpool: CarpoolInterface = {
  _id: 1,
  trip_id: v4(),
  driver_identity_uuid: v4(),
  passenger_identity_uuid: v4(),
  operator_siret: '89248032800012',
  operator_class: 'C',
  passenger_is_over_18: true,
  driver_has_travel_pass: true,
  passenger_has_travel_pass: true,
  datetime: new Date('2019-01-15'),
  seats: 1,
  duration: 600,
  distance: 5000,
  cost: 20,
  driver_payment: 20,
  passenger_payment: 20,
  start: { ...defaultPosition },
  end: { ...defaultPosition },
};

export function generateCarpool(
  carpool: Partial<CarpoolInterface> = {},
  defaultCarpool: CarpoolInterface = dftCarpool,
): CarpoolInterface {
  return { ...defaultCarpool, ...carpool };
}

const defaultIncentive: SerializedIncentiveInterface = {
  _id: 1,
  policy_id: 1,
  carpool_id: 1,
  datetime: new Date('2019-01-15'),
  statelessAmount: 100,
  statefulAmount: 100,
  status: IncentiveStatusEnum.Draft,
  state: IncentiveStateEnum.Regular,
  meta: [],
};

export function generateIncentive(incentive: Partial<SerializedIncentiveInterface> = {}): SerializedIncentiveInterface {
  return { ...defaultIncentive, ...incentive };
}

export function generatePartialCarpools(count = 75): Partial<CarpoolInterface>[] {
  const date: Date = new Date('2022-01-01');
  return [
    ...Array(count + 1 + 1)
      .slice(1)
      .keys(),
  ].map((x) => ({
    datetime: x % 3 == 0 ? date.setDate(date.getDate() + 1) && new Date(date) : new Date(date),
    distance: 25_000,
    driver_identity_uuid: 'three',
    passenger_identity_uuid: v4(),
  }));
}
