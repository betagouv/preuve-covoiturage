export function stubStatList() {
  cy.route({
    method: 'POST',
    url: '/rpc?methods=trip:stats',
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
