export enum TerritoryCodeEnum {
  Arr = 'arr',
  City = 'com',
  CityGroup = 'epci',
  Mobility = 'aom',
  Region = 'reg',
  Id = '_id',
  District = 'dep',
}

export interface TerritoryCodeInterface {
  [TerritoryCodeEnum.Arr]?: string;
  [TerritoryCodeEnum.City]: string;
  [TerritoryCodeEnum.Mobility]: string;
  [TerritoryCodeEnum.CityGroup]: string;
}

export interface TerritorySelectorsInterface {
  [TerritoryCodeEnum.Arr]?: string[];
  [TerritoryCodeEnum.City]?: string[];
  [TerritoryCodeEnum.Mobility]?: string[];
  [TerritoryCodeEnum.Id]?: number[];
  [TerritoryCodeEnum.CityGroup]?: string[];
}

export interface SelectorNameInterface {
  code: string;
  name: string;
}

export interface TerritorySelectorDetailsInterface {
  [TerritoryCodeEnum.Arr]?: SelectorNameInterface[];
  [TerritoryCodeEnum.City]?: SelectorNameInterface[];
  [TerritoryCodeEnum.Mobility]?: SelectorNameInterface[];
  [TerritoryCodeEnum.Id]?: SelectorNameInterface[];
  [TerritoryCodeEnum.CityGroup]?: SelectorNameInterface[];
}
