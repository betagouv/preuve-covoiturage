export interface SingleResultInterface {
  territory:string,
  l_territory:string,
  journeys?:number,
  trips?:number,
  has_incentive?:number,
  occupation_rate?:number,
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
  method: 'evolMonthlyOccupation',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;