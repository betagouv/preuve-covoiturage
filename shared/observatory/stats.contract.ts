

export interface DataSetInterface {
  l_arr: string | null;
}

export interface ResultInterface {
  data: DataSetInterface[];
}

export interface ParamsInterface {
  tz?: string;
}

export const handlerConfig = {
  service: 'observatory',
  method: 'stats',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;