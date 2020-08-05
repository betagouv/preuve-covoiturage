export interface ParamsInterface {
  _id: number;
}

export interface UiStatusRelationDetails {
  id: number;
  name: string;
  state: number;
  children: ResultInterface;
}

export type ResultInterface = UiStatusRelationDetails[];

export const handlerConfig = {
  service: 'territory',
  method: 'getTerritoryRelationUIStatus',
};
export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
