import { env } from '@ilos/core';
import { ApplicationCooldownConstraint, TimeRangeConstraint, ValidJourneyConstraint } from '../interfaces';

export const validJourneyConstraint: ValidJourneyConstraint = {
  operator_class: 'C',
  start_date: new Date(env.or_fail('APP_CEE_START_DATE', '2023-01-01T00:00:00+0100')),
  end_date: new Date('2024-01-01T00:00:00+0100'),
  max_distance: 80_000,
  geo_pattern: '99%',
};

// Le temps exprimé en année à partir duquel une nouvelle demande peut être réalisée
export const applicationCooldownConstraint: ApplicationCooldownConstraint = {
  short: {
    specific: {
      year: 3,
      after: new Date('2020-01-01T00:00:00+0100'),
    },
    standardized: {
      year: 5,
    },
  },
  long: {
    specific: {
      year: 10,
      after: new Date('2015-01-01T00:00:00+0100'),
    },
    standardized: {
      year: 12,
    },
  },
};

// A partir de combien de jour les demandes peuvent être envoyées
export const timeRangeConstraint: TimeRangeConstraint = {
  short: env.or_int('APP_CEE_DELAY', 7),
  long: env.or_int('APP_CEE_DELAY', 7),
};
