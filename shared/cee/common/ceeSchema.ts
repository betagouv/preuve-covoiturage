export const ceeJourneyTypeEnumSchema = {
  type: 'string',
  enum: ['short', 'long'],
  errorMessage: 'must be either short or long',
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
  cast: 'isodate',
  errorMessage: 'must be a valid is ISO 8601 UTC date',
};

export const journeyIdSchema = {
  macro: 'serial',
};

export const operatorJourneyIdSchema = {
  macro: 'varchar',
};

export const statusSchema = {
  macro: 'varchar',
};

export const tokenSchema = {
  macro: 'varchar',
};
