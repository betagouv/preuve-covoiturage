export enum TerritoryCodeEnum {
  Insee = 'insee',
  Postcode = 'postcode',
  Id = '_id',
}

export interface TerritoryCodeInterface {
  type: TerritoryCodeEnum;
  value: string;
}

export interface TerritoryCodesInterface {
  [TerritoryCodeEnum.Insee]?: string[];
  [TerritoryCodeEnum.Postcode]?: string[];
  [TerritoryCodeEnum.Id]?: string[];
}
