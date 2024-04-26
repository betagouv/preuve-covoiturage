import { CeeJourneyTypeEnum } from '@shared/cee/common/CeeApplicationInterface';
export { CeeJourneyTypeEnum };

export interface RegisteredCeeApplication {
  uuid: string;
  datetime: Date;
  operator_id: number;
  operator_siret: string;
  journey_type: CeeJourneyTypeEnum;
  driving_license?: string;
}

export interface ExistingCeeApplication extends RegisteredCeeApplication {
  acquisition_id?: number;
  acquisition_status?: string;
}

export interface ValidJourney {
  acquisition_id: number;
  carpool_id: number;
  operator_journey_id: string;
  phone_trunc: string;
  datetime: Date;
  status: string;
  already_registered: boolean;
  identity_key?: string;
}

export interface CeeApplication<T = Date> {
  application_timestamp: T;
  operator_id: number;
  last_name_trunc: string;
  phone_trunc: string;
  datetime: T;
  identity_key?: string;
}

export interface LongCeeApplication<T = Date> extends CeeApplication<T> {
  driving_license: string;
}

export interface ShortCeeApplication<T = Date> extends CeeApplication<T> {
  driving_license: string;
  carpool_id: number;
  operator_journey_id: string;
}

export interface SearchCeeApplication {
  datetime: Date;
  last_name_trunc: string;
  phone_trunc: string;
  driving_license?: string;
  identity_key?: string;
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

interface CooldownConstraint {
  year: number;
  after?: Date;
}

export interface ApplicationCooldownConstraint {
  short: {
    specific: CooldownConstraint;
    standardized: CooldownConstraint;
  };
  long: {
    specific: CooldownConstraint;
    standardized: CooldownConstraint;
  };
}

export interface TimeRangeConstraint {
  short: number;
  long: number;
}

export enum CeeApplicationErrorEnum {
  /** Payload validation error */
  Validation = 'validation',
  /** Date validation error (application too early) */
  Date = 'date',
  /** Short distance journey not eligible (or not found) */
  NonEligible = 'non-eligible',
  /** Another application is already registered */
  Conflict = 'conflict',
}

export interface CeeApplicationError {
  operator_id: number;
  error_type: CeeApplicationErrorEnum;
  journey_type: CeeJourneyTypeEnum;
  datetime?: string;
  last_name_trunc?: string;
  phone_trunc?: string;
  driving_license?: string;
  operator_journey_id?: string;
  application_id?: string;
  identity_key?: string;
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
  abstract registerApplicationError(data: CeeApplicationError): Promise<void>;
  abstract importSpecificApplicationIdentity(
    data: Required<CeeApplication> & { journey_type: CeeJourneyTypeEnum },
  ): Promise<void>;
  abstract importStandardizedApplicationIdentity(data: {
    cee_application_uuid: string;
    identity_key: string;
    operator_id: number;
  }): Promise<void>;
}
