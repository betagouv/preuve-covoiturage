import { test5PassengerOnly } from './test5PassengerOnly';

export const test2MissingUserAuth = {
  id: 1,
  jsonrpc: '2.0',
  method: 'acquisition:create',
  params: {
    params: test5PassengerOnly,
    _context: {
      call: {
        user: {},
      },
    },
  },
};
