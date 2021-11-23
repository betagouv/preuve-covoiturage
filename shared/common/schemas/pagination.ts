export const limit = {
  type: 'integer',
  minimum: 1,
  maximum: 50000,
};
export const offset = {
  type: 'integer',
  minimum: 1,
  maximum: 50000,
};
export const pagination = {
  limit,
  offset,
};
