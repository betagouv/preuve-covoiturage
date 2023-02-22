export interface ResultInterface {
  territory: string;
  l_territory: string;
  type: string;
}

export interface ParamsInterface {
  year: number;
  code: string;
  type: string;
}

export const handlerConfig = {
  service: 'observatory',
  method: 'territoryName',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
