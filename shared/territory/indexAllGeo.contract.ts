export interface ParamsInterface {
  year: number;
  month: number;
}

export const handlerConfig = {
  service: 'territory',
  method: 'indexAllGeo',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;