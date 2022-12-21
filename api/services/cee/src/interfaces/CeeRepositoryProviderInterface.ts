import { CeeJourneyTypeEnum } from '../shared/cee/common/CeeApplicationInterface';
export { CeeJourneyTypeEnum };

export interface ExistingCeeApplication {
  _id: string;
  operator_id: number;
  datetime: Date;
}

export interface RegisteredCeeApplication {
  operator_siret: string;
  journey_type: CeeJourneyTypeEnum;
  driving_license?: string;
  datetime: Date;
  uuid: string;
}

export interface ValidJourney {
  acquisition_id: number;
  carpool_id: number;
  phone_trunc: string;
  datetime: Date;
  status: string;
  already_registered: boolean;
}

export interface CeeApplication<T = Date> {
  application_timestamp: T;
  operator_id: number;
  last_name_trunc: string;
  phone_trunc: string;
  datetime: T;
}

export interface LongCeeApplication<T = Date> extends CeeApplication<T> {
  driving_license: string;
}

export interface ShortCeeApplication<T = Date> extends CeeApplication<T> {
  driving_license: string;
  carpool_id: number;
}

export interface SearchCeeApplication {
  last_name_trunc: string;
  phone_trunc: string;
  driving_license?: string;
}

export interface SearchJourney {
  operator_id: number;
  operator_journey_id: string;
}

export interface ValidJourneyConstraint {
  operator_class: 'A' | 'B' | 'C';
  start_date: Date;
  end_date: Date;
  max_distance: number;
  geo_pattern: string;
}

export interface ApplicationCooldownConstraint {
  short: {
    specific: number;
    standardized: number;
  };
  long: {
    specific: number;
    standardized: number;
  };
}

export interface TimeRangeConstraint {
  short: number;
  long: number;
}

export abstract class CeeRepositoryProviderInterfaceResolver {
  abstract readonly table: string;
  abstract searchForShortApplication(
    search: SearchCeeApplication,
    constraint: ApplicationCooldownConstraint,
  ): Promise<ExistingCeeApplication | void>;
  abstract searchForLongApplication(
    search: SearchCeeApplication,
    constraint: ApplicationCooldownConstraint,
  ): Promise<ExistingCeeApplication | void>;
  abstract searchForValidJourney(search: SearchJourney, constraint: ValidJourneyConstraint): Promise<ValidJourney>;
  abstract registerShortApplication(
    data: ShortCeeApplication,
    constraint: ApplicationCooldownConstraint,
  ): Promise<RegisteredCeeApplication>;
  abstract registerLongApplication(
    data: LongCeeApplication,
    constraint: ApplicationCooldownConstraint,
  ): Promise<RegisteredCeeApplication>;
  abstract importApplication(data: CeeApplication & { journey_type: CeeJourneyTypeEnum }): Promise<void>;
}
