export const handlerConfig = {
  service: 'policy',
  method: 'stats',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
