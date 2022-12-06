export type ParamsInterface = void;

export interface ResultInterface {
  year:string,
  month:string,
}

export const handlerConfig = {
  service: 'observatory',
  method: 'lastRecordMonthlyFlux',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;