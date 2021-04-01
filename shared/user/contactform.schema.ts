export const contactform = {
  $id: 'user.contactform',
  type: 'object',
  required: ['email', 'body'],
  additionalProperties: false,
  properties: {
    job: { type: 'string', minLength: 1, maxLength: 256 },
    name: { type: 'string', minLength: 1, maxLength: 256 },
    body: { type: 'string', minLength: 1, maxLength: 4096 },
    email: { macro: 'email' },
    company: { type: 'string', minLength: 1, maxLength: 256 },
    subject: { type: 'string', minLength: 1, maxLength: 256 },
  },
};

export const alias = contactform.$id;
