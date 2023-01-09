export interface SingleResultInterface {
  ter1:string,
  l_ter1:string,
  ter2:string,
  l_ter2:string,
  journeys:number,
}

export type ResultInterface = SingleResultInterface[];

export interface ParamsInterface {
  year:number,
  month:number,
  t:string, //type de territoire selectionné
  code:string, //code insee du territoire observé
  limit?:number //Nb de résultats
}

export const handlerConfig = {
  service: 'observatory',
  method: 'bestMonthlyFlux',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;