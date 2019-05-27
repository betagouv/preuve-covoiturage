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
      maxlength: 128,
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
      maxlength: 128,
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
      maxlength: 255,
      // ObjectId
    },
    aom: {
      type: 'string',
      maxlength: 255,
      // ObjectId
    },
  },
};
