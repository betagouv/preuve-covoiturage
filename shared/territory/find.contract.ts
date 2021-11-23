import { TerritoryCodesInterface } from './common/interfaces/TerritoryCodeInterface';
import { TerritoryBaseInterface } from './common/interfaces/TerritoryInterface';
import { TerritoryDbMetaInterface } from './common/interfaces/TerritoryDbMetaInterface';


export interface ParamsInterface {
  _id: number;
}

export interface ResultInterface
  extends Partial<TerritoryBaseInterface>,
    Partial<TerritoryDbMetaInterface>,
    Partial<TerritoryCodesInterface> {}

export const handlerConfig = {
  service: 'territory',
  method: 'find',
};
export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
