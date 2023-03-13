export interface ParamsInterface {
  year: number;
  month: number;
}

export const handlerConfig = {
  service: 'observatory',
  method: 'insertMonthlyFlux',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
