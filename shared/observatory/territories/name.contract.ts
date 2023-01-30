export interface ResultInterface {
  territory: string;
  l_territory: string;
  type: string;
}

export interface ParamsInterface {
  year: number;
  code: string;
  t: string;
}

export const handlerConfig = {
  service: 'observatory',
  method: 'territoryName',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
