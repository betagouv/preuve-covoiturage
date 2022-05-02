export enum TerritoryCodeEnum {
  Arr = 'arr',
  City = 'com',
  Mobility = 'aom',
  Id = '_id',
}

export interface TerritoryCodeInterface {
  [TerritoryCodeEnum.Arr]?: string;
  [TerritoryCodeEnum.City]: string;
  [TerritoryCodeEnum.Mobility]: string;
}

export interface TerritorySelectorsInterface {
  [TerritoryCodeEnum.Arr]?: string[];
  [TerritoryCodeEnum.City]?: string[];
  [TerritoryCodeEnum.Mobility]?: string[];
  [TerritoryCodeEnum.Id]?: number[];
}
