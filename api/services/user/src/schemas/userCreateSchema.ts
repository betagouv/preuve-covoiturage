export const UserCreateSchema = {
  $id: 'user.create',
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
    password: {
      type: 'string',
      minlength: 6,
      maxlength: 128,
      // trim: false,
      // hidden: true,
      // crypt: true,
    },
    operator: {
      type: 'string',
      // ObjectId
    },
    aom: {
      type: 'string',
      // ObjectId
    },
  },
};
