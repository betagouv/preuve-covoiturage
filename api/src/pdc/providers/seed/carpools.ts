import { faker } from '@faker-js/faker';
import { v4 } from 'uuid';
import { CarpoolAcquisitionStatusEnum, CarpoolFraudStatusEnum, CarpoolV1StatusEnum } from '../carpool/interfaces';
import { PaymentInterface } from '../normalization/interfaces';

export interface Carpool {
  _id: number;
  acquisition_id: number;
  trip_id: string;
  operator_trip_id: string;
  operator_journey_id: string;
  operator_id: number;
  is_driver: boolean;
  operator_class: string;
  datetime: Date;
  duration: number;
  distance: number;
  start_position: {
    lat: number;
    lon: number;
  };
  end_position: {
    lat: number;
    lon: number;
  };
  seats: number;
  identity_uuid: string;
  identity_key: string;
  identity_operator_user_id: string;
  identity_travel_pass: string;
  identity_travelpass_name: string;
  identity_travelpass_user_id: string;
  identity_over_18: boolean;
  identity_phone: string;
  identity_phone_trunc: string;
  cost: number;
  calc_distance: number;
  calc_duration: number;
  status: CarpoolV1StatusEnum;
  acquisition_status: CarpoolAcquisitionStatusEnum;
  fraud_status: CarpoolFraudStatusEnum;
  start_geo_code: string;
  end_geo_code: string;

  // v2
  licence_plate: string;
  driver_identity_key: string;
  driver_operator_user_id: string;
  driver_phone: string;
  driver_phone_trunc: string;
  driver_travelpass_name: string;
  driver_travelpass_user_id: string;
  driver_revenue: number;
  passenger_identity_key: string;
  passenger_operator_user_id: string;
  passenger_phone: string;
  passenger_phone_trunc: string;
  passenger_travelpass_name: string;
  passenger_travelpass_user_id: string;
  passenger_over_18: boolean | null;
  passenger_seats: number;
  passenger_contribution: number;
  passenger_payments: PaymentInterface[];
}

function phone_trunc(): string {
  return `${faker.helpers.arrayElement(['+33', '+262', '+590'])}6${faker.number.int({ min: 10_00_00, max: 99_99_99 })}`;
}

function defaultCarpool(): Carpool {
  return {
    _id: faker.number.int(),
    acquisition_id: 1,
    trip_id: 'trip_id',
    operator_journey_id: 'operator_journey_id',
    operator_trip_id: 'operator_trip_id',
    operator_id: 1,
    is_driver: true,
    operator_class: 'C',
    datetime: new Date(),
    duration: 900,
    calc_duration: 900,
    distance: 10000,
    calc_distance: 10000,
    start_geo_code: '91471',
    start_position: {
      lat: 48.706241,
      lon: 2.192278,
    },
    end_geo_code: '91377',
    end_position: {
      lat: 48.723260436194565,
      lon: 2.2604199486295267,
    },
    seats: 1,
    identity_uuid: v4(),
    identity_travel_pass: 'identity_travel_pass',
    identity_over_18: true,
    identity_phone_trunc: '+336000000',
    cost: 100,
    status: faker.helpers.arrayElement([
      CarpoolV1StatusEnum.Ok,
      CarpoolV1StatusEnum.Expired,
      CarpoolV1StatusEnum.Canceled,
      CarpoolV1StatusEnum.FraudcheckError,
      CarpoolV1StatusEnum.AnomalyError,
    ]),
    acquisition_status: faker.helpers.arrayElement([
      CarpoolAcquisitionStatusEnum.Canceled,
      CarpoolAcquisitionStatusEnum.Expired,
      CarpoolAcquisitionStatusEnum.Failed,
      CarpoolAcquisitionStatusEnum.Processed,
      CarpoolAcquisitionStatusEnum.Received,
      CarpoolAcquisitionStatusEnum.Updated,
    ]),
    fraud_status: faker.helpers.arrayElement([
      CarpoolFraudStatusEnum.Pending,
      CarpoolFraudStatusEnum.Passed,
      CarpoolFraudStatusEnum.Failed,
    ]),

    // v2
    licence_plate: faker.vehicle.vrm(),
    driver_identity_key: v4(),
    driver_operator_user_id: v4(),
    driver_phone: null,
    driver_phone_trunc: phone_trunc(),
    driver_travelpass_name: faker.word.noun(),
    driver_travelpass_user_id: v4(),
    driver_revenue: faker.number.int({ min: 0, max: 10_00 }),
    passenger_identity_key: v4(),
    passenger_operator_user_id: v4(),
    passenger_phone: null,
    passenger_phone_trunc: phone_trunc(),
    passenger_travelpass_name: faker.word.noun(),
    passenger_travelpass_user_id: v4(),
    passenger_over_18: faker.helpers.arrayElement([true, false, null]),
    passenger_seats: faker.number.int({ min: 1, max: 4 }),
    passenger_contribution: faker.number.int({ min: 0, max: 5_00 }),
    passenger_payments: faker.helpers.multiple(
      (): PaymentInterface => {
        return {
          index: faker.number.int({ min: 0, max: 10 }),
          siret: String(faker.number.int({ min: 100_000_000_00000, max: 999_999_999_99999 })),
          type: 'payment',
          amount: faker.number.int({ min: 0, max: 10_00 }),
        };
      },
      { count: { min: 0, max: 3 } },
    ),
  };
}

function makeCarpoolsFromAcquisition(acquisition_id: number, data: Partial<Carpool>): [Carpool, Carpool] {
  const commonData = {
    _id: acquisition_id,
    acquisition_id,
    trip_id: `trip_id-${acquisition_id}`,
    operator_journey_id: `operator_journey_id-${acquisition_id}`,
    operator_trip_id: `operator_trip_id-${acquisition_id}`,
  };

  return [
    // driver
    {
      ...defaultCarpool(),
      ...commonData,
      is_driver: true,
      identity_uuid: v4(),
      ...data,
    },

    // passenger
    {
      ...defaultCarpool(),
      ...commonData,
      _id: commonData._id + 1,
      is_driver: false,
      identity_uuid: v4(),
      ...data,
    },
  ];
}

export const carpools: Carpool[] = [
  ...makeCarpoolsFromAcquisition(1, { datetime: new Date('2022-06-15') }),
  ...makeCarpoolsFromAcquisition(3, { datetime: new Date('2022-06-16') }),
  ...makeCarpoolsFromAcquisition(5, { datetime: new Date('2022-06-16'), status: CarpoolV1StatusEnum.FraudcheckError }),
];
