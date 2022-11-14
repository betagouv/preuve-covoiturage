export enum CeeJourneyTypeEnum {
  Short = 'short',
  Long = 'long',
}
export const ceeJourneyTypeEnumSchema = {
  type: 'string',
  enum: ['short', 'long'],
};

export type PhoneTrunc = string;
export const phoneTruncSchema = {
  macro: 'phonetrunc',
};

export type LastNameTrunc = string;
export const lastNameTruncSchema = {
  type: 'string',
  minLength: 3,
  maxLength: 3,
  pattern: /^[A-Z ]{3}$/
};

export type DrivingLicense = string;
export const drivingLicenseSchema = {
  oneOf: [
    {
      type: 'string',
      description: 'Numéro de permis de conduire composé de 12 chiffres après 1975.',
      example: '051227308989',
      pattern: /^[0-9]{12}$/,
      minLength: 12,
      maxLength: 12,
    },
    {
      type: 'string',
      description: 'Numéro de permis de conduire composé de 1 à 15 caractères suivis de 4 chiffres avant 1975.',
      example: '822146819',
      pattern: /^[A-Z0-9]{1,15}[0-9]{4}$/,
      minLength: 5,
      maxLength: 19,
    },
    {
      type: 'string',
      description: 'Numéro de permis étranger préfixé de l\'indicatif \'99-\'.',
      example: '99-X23836',
      pattern: /^99-.*$/,
      minLength: 4,
      maxLength: 64,
    }
  ]
};

export type Timestamp = string;
export const timestampSchema = {
  type: 'string',
  format: 'date-time',
  cast: 'date',
  maxLength: 64,
}

export type JourneyId = number;
export const journeyIdSchema = {
  macro: 'serial',
}

export type OperatorJourneyId = string;
export const operatorJourneyIdSchema  = {
  macro: 'varchar'
}

export type Status = string;
export const statusSchema = {
  macro: 'varchar',
}

export type Token = string;
export const tokenSchema = {
  macro: 'varchar',
}

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
}

export type CeeApplicationInterface = CeeShortApplicationInterface | CeeLongApplicationInterface;

export interface CeeSimulateInterface {
  journey_type: CeeJourneyTypeEnum;
  last_name_trunc: LastNameTrunc;
  phone_trunc: PhoneTrunc;
  driving_license?: DrivingLicense;
}

export interface CeeImportInterface {
  last_name_trunc: LastNameTrunc;
  phone_trunc: PhoneTrunc;
  datetime: Timestamp;
}

export interface CeeImportResultInterface {
  imported: number;
  failed: number;
  failed_details: Array<CeeImportInterface & { error: string }>;
}
