const flowsPolicy = {
  name: 'admin::hasPermissions',
  config: { actions: ['plugin::betagouv.flows.run'] },
};

export default [
  {
    method: 'GET',
    path: '/flows',
    handler: 'flows.index',
    config: {
      policies: [flowsPolicy],
    },
  },
  {
    method: 'POST',
    path: '/flows/:id',
    handler: 'flows.run',
    config: {
      policies: [flowsPolicy],
    },
  },
];
