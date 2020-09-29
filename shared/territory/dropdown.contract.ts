export interface ParamsInterface {
  search?: string;
  parent_id?: number;
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
