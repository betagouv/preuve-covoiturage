export interface ParamsInterface {
  search?: string;
  on_territories?: number[];
  limit?: number;
}

export interface ResultInterface {
  _id: number;
  name: string;
}

export const handlerConfig = {
  service: 'territory',
  method: 'dropdown',
};
export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
