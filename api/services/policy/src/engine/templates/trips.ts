import { TripInterface } from '../../interfaces';
import { faker } from '../helpers/faker';

const tripDefinitions = [
  {
    passenger_carpool_id: 11,
    driver_carpool_id: 10,
    distance: 1000,
    driver_identity_uuid: '0',
    passenger_identity_uuid: '1',
    passenger_seats: 1,
    inside: true,
    datetime: '2019-01-15T11:00:00.000Z',
  },
  {
    passenger_carpool_id: 23,
    driver_carpool_id: 22,
    distance: 5000,
    driver_identity_uuid: '2',
    passenger_identity_uuid: '3',
    passenger_seats: 1,
    inside: false,
    datetime: '2019-01-15T11:00:00.000Z',
  },
  {
    passenger_carpool_id: 35,
    driver_carpool_id: 34,
    distance: 5000,
    driver_identity_uuid: '4',
    passenger_identity_uuid: '5',
    passenger_seats: 2,
    inside: true,
    datetime: '2019-01-15T04:00:00.000Z',
  },
  {
    passenger_carpool_id: 45,
    driver_carpool_id: 44,
    distance: 7500,
    driver_identity_uuid: '4',
    passenger_identity_uuid: '5',
    passenger_seats: 4,
    inside: true,
    datetime: '2019-01-15T11:00:00.000Z',
  },
  {
    passenger_carpool_id: 55,
    driver_carpool_id: 54,
    distance: 75000,
    driver_identity_uuid: '4',
    passenger_identity_uuid: '5',
    passenger_seats: 2,
    inside: true,
    datetime: '2019-01-15T13:00:00.000Z',
  },
  {
    passenger_carpool_id: 67,
    driver_carpool_id: 66,
    distance: 750000,
    driver_identity_uuid: '6',
    passenger_identity_uuid: '7',
    passenger_seats: 1,
    inside: true,
    datetime: '2019-01-15T11:00:00.000Z',
  },
  {
    passenger_carpool_id: 75,
    driver_carpool_id: 74,
    distance: 7500,
    driver_identity_uuid: '4',
    passenger_identity_uuid: '5',
    passenger_seats: 2,
    inside: true,
    datetime: '2019-01-17T11:00:00.000Z',
  },
  {
    passenger_carpool_id: 87,
    driver_carpool_id: 86,
    distance: 5000,
    driver_identity_uuid: '6',
    passenger_identity_uuid: '7',
    passenger_seats: 3,
    inside: true,
    datetime: '2019-01-20T13:00:00.000Z',
  },
];

export const trips: TripInterface[] = [
  ...tripDefinitions.map((def) =>
    faker.trip(
      [
        {
          carpool_id: def.driver_carpool_id,
          distance: def.distance,
          datetime: new Date(def.datetime),
          is_driver: true,
          identity_uuid: def.driver_identity_uuid,
        },
        {
          carpool_id: def.passenger_carpool_id,
          distance: def.distance,
          datetime: new Date(def.datetime),
          is_driver: false,
          identity_uuid: def.passenger_identity_uuid,
          seats: def.passenger_seats,
        },
      ],
      {
        territories: def.inside ? [1] : [2],
        datetime: new Date(def.datetime),
      },
    ),
  ),
];
