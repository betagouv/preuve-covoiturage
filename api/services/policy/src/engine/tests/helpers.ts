import { v4 } from 'uuid';
import {
  CarpoolInterface,
  IncentiveStateEnum,
  IncentiveStatusEnum,
  SerializedIncentiveInterface,
} from '../../interfaces';

const defaultPos = {
  arr: '91377',
  com: '91377',
  aom: '217500016',
  epci: '200056232',
  dep : '91',
  reg : '11',
  country: 'XXXXX',
  reseau : '232',
};

const defaultCarpool: CarpoolInterface = {
  _id: 1,
  trip_id: v4(),
  identity_uuid: v4(),
  operator_siret: '89248032800012',
  operator_class: 'C',
  is_over_18: true,
  is_driver: true,
  has_travel_pass: true,
  datetime: new Date('2019-01-15'),
  seats: 1,
  duration: 600,
  distance: 5000,
  cost: 20,
  start: { ...defaultPos },
  end: { ...defaultPos },
};

export function generateCarpool(carpool: Partial<CarpoolInterface> = {}): CarpoolInterface {
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
