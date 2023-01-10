export interface SingleResultInterface {
  l_territory:string,
  journeys:number,
}

export type ResultInterface = SingleResultInterface[];

export interface ParamsInterface {
  year:number,
  month:number,
  t:string, //type de territoire selectionné
  t2:string, //type du territoire observé
  code:string, //code insee du territoire observé
  limit?:number,
}

export const handlerConfig = {
  service: 'observatory',
  method: 'bestMonthlyTerritories',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;