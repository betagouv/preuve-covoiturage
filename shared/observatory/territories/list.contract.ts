export interface SingleResultInterface {
  territory:string,
  l_territory:string,
  type:string,
}

export type ResultInterface = SingleResultInterface[];

export interface ParamsInterface {
  year:number,
}

export const handlerConfig = {
  service: 'observatory',
  method: 'territoriesList',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;