export enum InsertTypeEnum {
  ALL = 'all',
  LAST = 'last',
};

export interface ParamsInterface {
  type:InsertTypeEnum,
};

export type ResultInterface = void;

export const handlerConfig = {
  service: 'observatory',
  method: 'insertFlux',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;