const andOrSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['start', 'end'],
  properties: {
    start: {
      type: 'array',
      items: {
        macro: 'insee',
      },
    },
    end: {
      type: 'array',
      items: {
        macro: 'insee',
      },
    },
  },
};
const blacklistWhitelistSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['and', 'or'],
  properties: {
    and: andOrSchema,
    or: andOrSchema,
  },
};

export const inseeFilterSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['whitelist', 'blacklist'],
  properties: {
    whitelist: blacklistWhitelistSchema,
    blacklist: blacklistWhitelistSchema,
  },
};
