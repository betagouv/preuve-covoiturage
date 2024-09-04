export const handlerConfig = {
  service: 'observatory',
  method: 'refreshAllDistribution',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
