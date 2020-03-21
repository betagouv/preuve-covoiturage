export function callFactory(user): Function {
  return (params: any = {}): object => ({
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
