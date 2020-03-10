import { TerritoryInterface } from './TerritoryInterface';

export interface TerritoryDbInterface extends TerritoryInterface {
  _id: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}
