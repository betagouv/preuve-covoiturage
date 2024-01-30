export default [
  {
    method: 'GET',
    path: '/flows',
    handler: 'flows.index',
    config: {
      policies: ['plugin::betagouv.hasPermission'],
    },
  },
  {
    method: 'POST',
    path: '/flows/:id',
    handler: 'flows.run',
    config: {
      policies: ['plugin::betagouv.hasPermission'],
    },
  },
];
