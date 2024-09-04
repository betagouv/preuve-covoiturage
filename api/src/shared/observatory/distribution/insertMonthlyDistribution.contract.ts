export interface ParamsInterface {
  year: number;
  month: number;
}

export const handlerConfig = {
  service: 'observatory',
  method: 'insertMonthlyDistribution',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
