export interface ParamsInterface {
  _id?: number;
}

export type ResultInterface = {
  _id: number[];
};

export const handlerConfig = {
  service: 'territory',
  method: 'getAuthorizedCodes',
};
export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
