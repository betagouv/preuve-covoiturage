import { TripInterface, PersonInterface } from '../../interfaces';

const datetime = new Date('2019-01-15');

const basePerson: PersonInterface = {
  datetime,
  identity_uuid: 'person',
  is_over_18: null,
  has_travel_pass: false,
  operator_id: 1,
  operator_class: 'C',
  is_driver: false,
  start_insee: '91377',
  end_insee: '91377',
  seats: 1,
  duration: 600,
  distance: 5000,
  cost: 2,
};

const baseTrip: TripInterface = {
  datetime,
  territories: [1],
  people: [],
};

function trip(people: Partial<PersonInterface>[] = [], shared: Partial<TripInterface> = {}): TripInterface {
  return {
    ...baseTrip,
    ...shared,
    people: [...people.map((p) => ({ ...basePerson, ...p }))],
  };
}

export const faker = {
  trip,
};
