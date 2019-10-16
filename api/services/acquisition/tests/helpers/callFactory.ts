export function callFactory(user) {
  return (params: any = {}) => ({
    id: 1,
    jsonrpc: '2.0',
    method: 'acquisition:create',
    params: {
      params,
      _context: {
        call: {
          user,
        },
      },
    },
  });
}
