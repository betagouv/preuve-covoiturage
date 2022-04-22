export enum TerritoryCodeEnum {
  Arr = 'arr',
  City = 'com',
  Mobility = 'aom',
  Id = '_id',
}

export interface TerritoryCodeInterface {
  type: TerritoryCodeEnum;
  value: string;
}

export interface TerritoryCodesInterface {
  [TerritoryCodeEnum.Arr]?: string[];
  [TerritoryCodeEnum.City]?: string[];
  [TerritoryCodeEnum.Mobility]?: string[];
  [TerritoryCodeEnum.Id]?: number[];
}
