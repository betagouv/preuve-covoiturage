export const ceeJourneyTypeEnumSchema = {
  type: 'string',
  enum: ['short', 'long'],
};

export const phoneTruncSchema = {
  macro: 'phonetrunc',
};

export const lastNameTruncSchema = {
  type: 'string',
  minLength: 3,
  maxLength: 3,
  pattern: '^[A-Z ]{3}$',
};

export const drivingLicenseSchema = {
  oneOf: [
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
};

export const timestampSchema = {
  cast: 'isodate',
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
