export const userSchema = {
  $id: 'user',
  type: 'object',
  required: ['email', 'lastname', 'firstname', 'group', 'permissions', 'password'],
  additionalProperties: false,
  properties: {
    email: {
      type: 'string',
      format: 'email',
      // match: regex.email,
      // trim: true,
      // lowercase: true,
      // unique: true,
    },
    lastname: {
      type: 'string',
      maxlength: 128,
    },
    firstname: {
      type: 'string',
      maxlength: 128,
    },
    phone: {
      type: 'string',
      // match: regex.phone,
      // set: setters.phone,
      // validate: validators.phone,
      // trim: true,
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
    permissions: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    password: {
      type: 'string',
      minlength: 6,
      maxlength: 128,
      // trim: false,
      // hidden: true,
      // crypt: true,
    },
    status: {
      type: 'string',
      enum: ['pending', 'invited', 'active', 'blocked'],
      default: 'pending',
    },
    hasResetPassword: {
      type: 'boolean',
      default: false,
    },
    forgottenReset: {
      type: 'string',
      // index: true, hidden: true
    },
    forgottenToken: {
      type: 'string',
      // crypt: true, hidden: true
    },
    forgottenAt: {
      type: 'string',
      format: 'date-time',
    },
    lastConnectedAt: {
      type: 'string',
      format: 'date-time',
    },
    operator: {
      type: 'string',
      // ObjectId
    },
    aom: {
      type: 'string',
      // ObjectId
    },
    options: {
      type: 'object',
      default: {},
    },
    deletedAt: {
      type: 'string',
      format: 'date-time',
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
    },
  },
};
