export interface SingleResultInterface {
  territory_1: string;
  l_territory_1: string;
  territory_2: string;
  l_territory_2: string;
  journeys: number;
}

export type ResultInterface = SingleResultInterface[];

export interface ParamsInterface {
  year: number;
  month: number;
  t: string; //type de territoire selectionné
  code: string; //code insee du territoire observé
  limit?: number; //Nb de résultats
}

export const handlerConfig = {
  service: 'observatory',
  method: 'bestMonthlyFlux',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
