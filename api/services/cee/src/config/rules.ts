import { ValidJourneyConstraint } from '../interfaces';

export const validJourneyConstraint: ValidJourneyConstraint = {
  operator_class: 'C',
  start_date: new Date('2023-01-01T00:00:00.000Z'),
  end_date: new Date('2024-01-01T00:00:00.000Z'),
  max_distance: 80_000,
  geo_pattern: '99%',
};
