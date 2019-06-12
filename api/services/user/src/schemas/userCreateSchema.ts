export const userCreateSchema = {
  $id: 'user.create',
  type: 'object',
  required: ['email', 'lastname', 'firstname', 'group', 'password'],
  additionalProperties: false,
  properties: {
    email: {
      type: 'string',
      format: 'email',
      maxLength: 128,
      minLength: 1,
      // match: regex.email,
      // trim: true,
      // lowercase: true,
      // unique: true,
    },
    lastname: {
      type: 'string',
      maxLength: 128,
    },
    firstname: {
      type: 'string',
      maxLength: 128,
    },
    phone: {
      type: 'string',
      // match: regex.phone,
      // set: setters.phone,
      // validate: validators.phone,
      // trim: true,
      maxLength: 128,
    },
    group: {
      type: 'string',
      enum: ['aom', 'operators', 'registry'],
    },
    role: {
      type: 'string',
      default: 'user',
      enum: ['admin', 'user'],
    },
    password: {
      type: 'string',
      minLength: 6,
      maxLength: 128,
      // trim: false,
    },
    operator: {
      type: 'string',
      maxLength: 255,
      // ObjectId
    },
    aom: {
      type: 'string',
      maxLength: 255,
      // ObjectId
    },
  },
  allOf: [
    {
      if: {
        properties: { group: { const: 'aom' } },
      },
      then: {
        required: ['email', 'lastname', 'firstname', 'group', 'password', 'aom'],
      },
    },
    {
      if: {
        properties: { group: { const: 'operator' } },
      },
      then: {
        required: ['email', 'lastname', 'firstname', 'group', 'password', 'operator'],
      },
    },
  ],
};
