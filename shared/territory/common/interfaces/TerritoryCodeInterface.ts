export enum TerritoryCodeEnum {
  Insee = 'insee',
  Postcode = 'postcode',
}

export interface TerritoryCodeInterface {
  type: TerritoryCodeEnum;
  value: string;
}

export interface TerritoryCodesInterface {
  [TerritoryCodeEnum.Insee]: string[];
  [TerritoryCodeEnum.Postcode]: string[];
}
