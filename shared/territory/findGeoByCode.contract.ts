export interface ParamsInterface {
  insees: string[];
}

export type ResultInterface = TerritoryInsee[];

export interface TerritoryInsee {
  territory_id: number;
  name: string;
}

export const handlerConfig = {
  service: 'territory',
  method: 'findGeoByCode',
};
export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
