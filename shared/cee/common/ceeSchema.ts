export const ceeJourneyTypeEnumSchema = {
  type: 'string',
  enum: ['short', 'long'],
  errorMessage: 'must be either short or long',
};

export const ceeApplicationTypeEnumSchema = {
  type: 'string',
  enum: ['specific', 'standardized'],
  errorMessage: 'must be either specific or standardized',
};

export const ceeApplicationUuidSchema = {
  type: 'string',
  format: 'uuid',
  maxLength: 36,
  errorMessage: 'must be a valid uuid',
};

export const identityKeySchema = {
  type: 'string',
  minLength: 64,
  maxLength: 64,
  errorMessage: 'must be a valid identity key',
};

export const phoneTruncSchema = {
  macro: 'phonetrunc',
  errorMessage: 'must be a valid trunced phone number',
};

export const lastNameTruncSchema = {
  type: 'string',
  minLength: 3,
  maxLength: 3,
  pattern: '^[A-Z ]{3}$',
  errorMessage: 'must be 3 caps characters long string',
};

export const drivingLicenseSchema = {
  anyOf: [
    {
      type: 'string',
      description: 'Numéro de permis de conduire composé de 12 chiffres après 1975.',
      example: '051227308989',
      pattern: '^[0-9]{12}$',
      minLength: 12,
      maxLength: 12,
    },
    {
      type: 'string',
      description: 'Numéro de permis de conduire composé de 1 à 15 caractères suivis de 4 chiffres avant 1975.',
      example: '822146819',
      pattern: '^[A-Z0-9]{1,15}[0-9]{4}$',
      minLength: 5,
      maxLength: 19,
    },
    {
      type: 'string',
      description: 'Numéro de permis de conduire composé de 1 à 15 caractères plus anciens',
      example: '123456A',
      pattern: '^[A-Z0-9]{1,15}$',
      minLength: 1,
      maxLength: 15,
    },
    {
      type: 'string',
      description: "Numéro de permis étranger préfixé de l'indicatif '99-'.",
      example: '99-X23836',
      pattern: '^99-.*$',
      minLength: 4,
      maxLength: 64,
    },
  ],
  errorMessage: 'must be a valid driving license id',
};

export const timestampSchema = {
  type: 'string',
  format: 'date-time',
  maxLength: 64,
  errorMessage: 'must be a valid is ISO 8601 UTC date',
};

export const journeyIdSchema = {
  macro: 'serial',
};

export const operatorJourneyIdSchema = {
  macro: 'varchar',
  errorMessage: 'must be a valid operator journey id',
};

export const statusSchema = {
  macro: 'varchar',
};

export const tokenSchema = {
  macro: 'varchar',
};
