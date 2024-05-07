import { CarpoolV1StatusEnum } from '@pdc/providers/carpool/interfaces';

export enum CeeJourneyTypeEnum {
  Short = 'short',
  Long = 'long',
}
export type PhoneTrunc = string;
export type LastNameTrunc = string;
export type DrivingLicense = string;
export type Timestamp = string;
export type JourneyId = string;
export type OperatorJourneyId = string;
export type Status = CarpoolV1StatusEnum;
export type Token = string;

export interface CeeApplicationResultInterface {
  uuid: string;
  datetime: Timestamp;
  token: Token;
  journey_id?: JourneyId;
  status?: Status;
}

export interface CeeShortApplicationInterface {
  application_timestamp: Timestamp;
  journey_type: CeeJourneyTypeEnum.Short;
  last_name_trunc: LastNameTrunc;
  driving_license: DrivingLicense;
  operator_journey_id: OperatorJourneyId;
  identity_key?: string;
}

export interface CeeLongApplicationInterface {
  application_timestamp: Timestamp;
  journey_type: CeeJourneyTypeEnum.Long;
  last_name_trunc: LastNameTrunc;
  driving_license: DrivingLicense;
  phone_trunc: PhoneTrunc;
  datetime: Date;
  identity_key?: string;
}

export type CeeApplicationInterface = CeeShortApplicationInterface | CeeLongApplicationInterface;

export interface CeeSimulateInterface {
  journey_type: CeeJourneyTypeEnum;
  last_name_trunc: LastNameTrunc;
  phone_trunc: PhoneTrunc;
  driving_license?: DrivingLicense;
  identity_key?: string;
}

export interface CeeSimulateResultInterface {
  datetime: Timestamp;
  uuid?: string;
}

export interface CeeImportInterface<T> {
  journey_type: CeeJourneyTypeEnum;
  last_name_trunc: LastNameTrunc;
  phone_trunc: PhoneTrunc;
  datetime: T;
}

export interface CeeImportStandardizedApplicationIdentityInterface {
  cee_application_type: 'standardized';
  cee_application_uuid: string;
  identity_key: string;
}

export interface CeeImportSpecificApplicationIdentityInterface extends CeeImportInterface<Date> {
  cee_application_type: 'specific';
  identity_key: string;
}

export type CeeImportIdentityInterface =
  | CeeImportStandardizedApplicationIdentityInterface
  | CeeImportSpecificApplicationIdentityInterface;

export interface CeeImportResultInterface<T> {
  imported: number;
  failed: number;
  failed_details: Array<T>;
}
