export function callFactory(method: string, params: any, perms: string[] = null) {
  const permissions = perms || [`user.${method}`];

  return {
    id: 1,
    jsonrpc: '2.0',
    method: `user:${method}`,
    params: {
      params,
      _context: {
        call: {
          user: {
            permissions,
          },
        },
      },
    },
  };
}
