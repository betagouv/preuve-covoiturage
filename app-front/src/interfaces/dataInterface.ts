export type UsersInterface = {
  meta: {
    page: number;
    total: number;
    totalPages: number;
  };
  data: {
    id?: number;
    firstname: string;
    lastname: string;
    email: string;
    operator_id?: number;
    territory_id?: number;
    phone?: string;
    role: string;
  }[];
};

export type Company = {
  result: {
    data: {
      _id: number;
      siret: string;
    };
  };
};

export enum TerritoryCodeEnum {
  Arr = "arr",
  City = "com",
  CityGroup = "epci",
  Mobility = "aom",
  Region = "reg",
  District = "dep",
}

export interface TerritorySelectorsInterface {
  [TerritoryCodeEnum.Arr]?: string[];
  [TerritoryCodeEnum.City]?: string[];
  [TerritoryCodeEnum.Mobility]?: string[];
  [TerritoryCodeEnum.District]?: string[];
  [TerritoryCodeEnum.CityGroup]?: string[];
  [TerritoryCodeEnum.Region]?: string[];
}

export type Territory = {
  _id?: number;
  name: string;
  siret: string;
};

export type TerritoriesInterface = {
  meta: {
    page: number;
    total: number;
    totalPages: number;
  };
  data: Territory[];
};

export type OperatorsInterface = {
  meta: {
    page: number;
    total: number;
    totalPages: number;
  };
  data: {
    id?: number;
    name: string;
    siret: string;
  }[];
};
