/**
 * 'meta' property is a JSON field in the database
 * It is used to store various additional information about the operator
 */
export const meta = {
  type: 'object',
  additionalProperties: false,
  required: [],
  properties: {
    logo_url: { macro: 'varchar' },
  },
};
