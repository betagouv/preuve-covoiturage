export enum CeeJourneyTypeEnum {
  Short = 'short',
  Long = 'long',
}
export type PhoneTrunc = string;
export type LastNameTrunc = string;
export type DrivingLicense = string;
export type Timestamp = string;
export type JourneyId = number;
export type OperatorJourneyId = string;
export type Status = string;
export type Token = string;

export interface CeeAplicationResultInterface {
  journey_type: CeeJourneyTypeEnum;
  timestamp: Timestamp;
  journey_id: JourneyId;
  status: Status;
  token: Token;
}

export interface CeeShortApplicationInterface {
  journey_type: CeeJourneyTypeEnum.Short;
  last_name_trunc: LastNameTrunc;
  driving_license: DrivingLicense;
  operator_journey_id: OperatorJourneyId;
}

export interface CeeLongApplicationInterface {
  journey_type: CeeJourneyTypeEnum.Long;
  last_name_trunc: LastNameTrunc;
  driving_license: DrivingLicense;
  phone_trunc: PhoneTrunc;
  datetime: Date;
}

export type CeeApplicationInterface = CeeShortApplicationInterface | CeeLongApplicationInterface;

export interface CeeSimulateInterface {
  journey_type: CeeJourneyTypeEnum;
  last_name_trunc: LastNameTrunc;
  phone_trunc: PhoneTrunc;
  driving_license?: DrivingLicense;
}

export interface CeeImportInterface<T> {
  journey_type: CeeJourneyTypeEnum;
  last_name_trunc: LastNameTrunc;
  phone_trunc: PhoneTrunc;
  datetime: T;
}

export interface CeeImportResultInterface {
  imported: number;
  failed: number;
  failed_details: Array<CeeImportInterface<string> & { error: string }>;
}
