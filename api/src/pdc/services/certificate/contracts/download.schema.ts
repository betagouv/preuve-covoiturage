export const alias = 'certificate.download';
export const schema = {
  $id: alias,
  type: 'object',
  required: ['uuid'],
  additionalProperties: false,
  properties: {
    uuid: { macro: 'uuid' },
    operator_id: { macro: 'dbid' },
    meta: {
      type: 'object',
      additionalProperties: false,
      properties: {
        operator: {
          type: 'object',
          additionalProperties: false,
          properties: {
            content: {
              type: 'string',
              minLength: 0,
              maxLength: 258,
              $comment: 'Multiline textarea. Max 6 lines of 50 chars. Use \n as newline',
            },
          },
        },
        identity: {
          type: 'object',
          additionalProperties: false,
          properties: {
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 42,
            },
            content: {
              type: 'string',
              minLength: 0,
              maxLength: 605,
              $comment: 'Multiline textarea. Max 6 lines of 50 chars. Use \n as newline',
            },
          },
        },
        notes: {
          type: 'string',
          minLength: 0,
          maxLength: 440,
          $comment: 'Multiline textarea with textWrap. Max 440 chars',
        },
      },
    },
  },
};
export const binding = [alias, schema];
