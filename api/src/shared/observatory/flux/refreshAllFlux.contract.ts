export const handlerConfig = {
  service: 'observatory',
  method: 'refreshAllFlux',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
