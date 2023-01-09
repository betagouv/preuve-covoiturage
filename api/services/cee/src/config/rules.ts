import { env } from '@ilos/core';
import { ApplicationCooldownConstraint, TimeRangeConstraint, ValidJourneyConstraint } from '../interfaces';
import { utcToZonedTime } from 'date-fns-tz';

export const defaultTz = 'Europe/Paris';

export const validJourneyConstraint: ValidJourneyConstraint = {
  operator_class: 'C',
  start_date: utcToZonedTime(new Date(env('APP_CEE_START_DATE', '2023-01-01T00:00:00.000Z') as string), defaultTz),
  end_date: utcToZonedTime(new Date('2024-01-01T00:00:00.000Z'), defaultTz),
  max_distance: 80_000,
  geo_pattern: '99%',
};

// Le temps exprimé en année à partir duquel une nouvelle demande peut être réalisée
export const applicationCooldownConstraint: ApplicationCooldownConstraint = {
  short: {
    specific: {
      year: 3,
      after: new Date('2020-01-01T00:00:00.000Z'),
    },
    standardized: {
      year: 5,
    },
  },
  long: {
    specific: {
      year: 10,
      after: new Date('2015-01-01T00:00:00.000Z'),
    },
    standardized: {
      year: 12,
    },
  },
};

// A partir de combien de jour les demandes peuvent être envoyées
export const timeRangeConstraint: TimeRangeConstraint = {
  short: parseInt(env('APP_CEE_DELAY', '7') as string),
  long: parseInt(env('APP_CEE_DELAY', '7') as string),
};
