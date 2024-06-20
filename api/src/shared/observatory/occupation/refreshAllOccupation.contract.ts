export const handlerConfig = {
  service: 'observatory',
  method: 'refreshAllOccupation',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
