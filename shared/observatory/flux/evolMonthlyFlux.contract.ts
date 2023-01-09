export interface SingleResultInterface {
  territory:string,
  l_territory:string,
  journeys?:number,
  passengers?:number,
  has_incentive?:number,
  distance?:number,
  duration?:number,
}

export type ResultInterface = SingleResultInterface[];

export interface ParamsInterface {
  year:number,
  month:number,
  t:string, //type de territoire selectionné
  code:string, //code insee du territoire observé
  indic:string,
  past?:string,
}

export const handlerConfig = {
  service: 'observatory',
  method: 'evolMonthlyFlux',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;