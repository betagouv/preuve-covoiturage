export function stubStatList() {
  cy.route({
    method: 'POST',
    url: '/rpc?methods=stat:list',
    response: (data) => ({
      payload: {
        data: [
          {
            id: 1568215196898,
            jsonrpc: '2.0',
            result: [],
          },
        ],
      },
    }),
  });
}
