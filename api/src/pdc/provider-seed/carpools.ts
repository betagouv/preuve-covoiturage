import { v4 } from 'uuid';

const defaultCarpool: Carpool = {
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
  status: 'ok',
};

export interface Carpool {
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
  identity_travel_pass: string;
  identity_over_18: boolean;
  identity_phone_trunc: string;
  cost: number;
  calc_distance: number;
  calc_duration: number;
  status: string;
  start_geo_code: string;
  end_geo_code: string;
}

function makeCarpoolsFromAcquisition(acquisition_id: number, data: Partial<Carpool>): Carpool[] {
  const commonData = {
    acquisition_id,
    trip_id: `trip_id-${acquisition_id}`,
    operator_journey_id: `operator_journey_id-${acquisition_id}`,
    operator_trip_id: `operator_trip_id-${acquisition_id}`,
  };
  return [
    {
      ...defaultCarpool,
      ...commonData,
      is_driver: true,
      identity_uuid: v4(),
      ...data,
    },
    {
      ...defaultCarpool,
      ...commonData,
      is_driver: false,
      identity_uuid: v4(),
      ...data,
    },
  ];
}

export const carpools: Carpool[] = [
  ...makeCarpoolsFromAcquisition(1, { datetime: new Date('2022-06-15') }),
  ...makeCarpoolsFromAcquisition(2, { datetime: new Date('2022-06-16') }),
  ...makeCarpoolsFromAcquisition(3, { datetime: new Date('2022-06-16'), status: 'fraudcheck_error' }),
];
