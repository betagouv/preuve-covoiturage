export enum TerritoryCodeEnum {
  Arr = "arr",
  City = "com",
  CityGroup = "epci",
  Mobility = "aom",
  Region = "reg",
  District = "dep",
  Network = "reseau",
  Country = "country",
}

export interface TerritoryCodeInterface {
  [TerritoryCodeEnum.Arr]?: string;
  [TerritoryCodeEnum.Country]?: string;
  [TerritoryCodeEnum.District]?: string;
  [TerritoryCodeEnum.Network]?: number;
  [TerritoryCodeEnum.City]: string;
  [TerritoryCodeEnum.Mobility]: string;
  [TerritoryCodeEnum.CityGroup]: string;
  [TerritoryCodeEnum.Region]: string;
}

export interface TerritorySelectorsInterface {
  [TerritoryCodeEnum.Arr]?: string[];
  [TerritoryCodeEnum.City]?: string[];
  [TerritoryCodeEnum.Mobility]?: string[];
  [TerritoryCodeEnum.District]?: string[];
  [TerritoryCodeEnum.CityGroup]?: string[];
  [TerritoryCodeEnum.Region]?: string[];
  [TerritoryCodeEnum.Country]?: string[];
}
