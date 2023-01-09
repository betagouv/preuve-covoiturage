export type ParamsInterface = void;

export interface ResultInterface {
  year:number,
  month:number,
}

export const handlerConfig = {
  service: 'observatory',
  method: 'lastRecordMonthlyFlux',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;