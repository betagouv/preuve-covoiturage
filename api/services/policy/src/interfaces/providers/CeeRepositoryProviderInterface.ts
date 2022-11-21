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

export interface CeeApplication {
  operator_id: number;
  last_name_trunc: string;
  phone_trunc: string;
  datetime: Date;
}

export interface LongCeeApplication extends CeeApplication {
  driving_license: string;
}

export interface ShortCeeApplication extends CeeApplication {
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
}