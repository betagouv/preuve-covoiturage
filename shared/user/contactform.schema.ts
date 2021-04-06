export const contactform = {
  $id: 'user.contactform',
  type: 'object',
  required: ['email', 'body'],
  additionalProperties: false,
  properties: {
    email: { macro: 'email' },
    job: { macro: 'varchar' },
    name: { macro: 'varchar' },
    company: { macro: 'varchar' },
    subject: { macro: 'varchar' },
    body: { type: 'string', minLength: 1, maxLength: 4096, sanitize: true },
  },
};

export const alias = contactform.$id;
