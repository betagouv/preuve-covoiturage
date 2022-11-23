import { CeeJourneyTypeEnum } from '../shared/cee/common/CeeApplicationInterface';
export { CeeJourneyTypeEnum }

export interface RegisteredCeeApplication {
  _id: string;
  operator_id: number;
  datetime: Date;
}

export interface ValidJourney {
  carpool_id: number;
  phone_trunc: string;
  datetime: Date;
  status: string;
}

export interface CeeApplication<T = Date> {
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
  operator_journey_id: number;
}

export abstract class CeeRepositoryProviderInterfaceResolver {
  abstract readonly table: string;
  abstract searchForShortApplication(search: SearchCeeApplication): Promise<RegisteredCeeApplication | void>;
  abstract searchForLongApplication(search: SearchCeeApplication): Promise<RegisteredCeeApplication | void>;
  abstract searchForValidJourney(search: SearchJourney): Promise<ValidJourney | void>; 
  abstract registerShortApplication(data: ShortCeeApplication, importOldApplication?: boolean): Promise<void>;
  abstract registerLongApplication(data: LongCeeApplication, importOldApplication?: boolean): Promise<void>;
  abstract importApplication(data: CeeApplication & { journey_type: CeeJourneyTypeEnum }): Promise<void>;
}