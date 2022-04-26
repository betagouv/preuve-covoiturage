import * as geo from './geo';

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
  [TerritoryCodeEnum.Id]?: number[];
}

export interface TerritoryGroupInterface {
  _id: number;
  company_id: number;
  name: string;
  shortname: string;
  contacts;
  address: {
    street: string;
    postcode: string;
    cedex?: string;
    city: string;
    country: string;
  };
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
  selector: TerritoryCodesInterface;
}

export type CreateTerritoryGroupInterface = Omit<
  TerritoryGroupInterface,
  '_id' | 'created_at' | 'updated_at' | 'deleted_at' | 'shortname'
>;

export interface Territory {
  _id: number;
  name: string;
  insee?: string;
  postcodes?: string[];
  children?: Territory[];
  geo?: any;
  level?: string;
  population?: number;
  surface?: number;
}

export const belgique = {
  _id: 1,
  name: 'Belgique',
  insee: '99131',
  geo: geo.belgique,
  level: 'country',
};

export const lille = {
  _id: 5,
  name: 'Lille',
  insee: '59350',
  postcodes: ['59800', '59000', '59260', '59777', '59160'],
  surface: 3478,
  population: 232440,
  geo: geo.lille,
  level: 'town',
};

export const nord = {
  _id: 4,
  name: 'Nord',
  insee: '59',
  level: 'district',
  children: [lille],
};

export const hautsDeFrance = {
  _id: 3,
  name: 'Hauts-De-France',
  insee: '32',
  level: 'region',
  children: [nord],
};

export const massy = {
  _id: 7,
  name: 'Massy',
  insee: '91377',
  postcodes: ['91300'],
  surface: 942,
  population: 49924,
  level: 'town',
  geo: geo.massy,
};

export const palaiseau = {
  _id: 8,
  name: 'Palaiseau',
  insee: '91477',
  postcodes: ['91120'],
  surface: 1165,
  population: 34120,
  level: 'town',
  geo: geo.palaiseau,
};

export const orsay = {
  _id: 9,
  name: 'Orsay',
  insee: '91471',
  postcodes: ['91400'],
  surface: 743,
  population: 16678,
  level: 'town',
  geo: geo.orsay,
};

export const essonne = {
  _id: 17,
  name: 'Essonne',
  level: 'district',
  insee: '91',
  children: [massy, palaiseau, orsay],
};

export const ileDeFrance = {
  _id: 6,
  name: 'Ile-De-France',
  level: 'region',
  insee: '11',
  children: [essonne],
};

export const lyon = {
  _id: 12,
  name: 'Lyon',
  insee: '69123',
  postcodes: ['69001', '69002', '69003', '69004', '69005', '69006', '69007', '69008', '69009'],
  surface: 4797,
  population: 515695,
  level: 'town',
  geo: geo.lyon,
};

export const venissieux = {
  _id: 13,
  name: 'Vennisieux',
  insee: '69259',
  postcodes: ['69200'],
  surface: 1545,
  population: 65405,
  level: 'town',
  geo: geo.venissieux,
};

export const rhone = {
  _id: 11,
  name: 'Rhone',
  insee: '69',
  level: 'district',
  children: [lyon, venissieux],
};

export const rhoneAlpes = {
  _id: 10,
  name: 'Rhone-Alpes',
  insee: '84',
  level: 'region',
  children: [rhone],
};

export const cayenne = {
  _id: 15,
  name: 'Cayenne',
  insee: '97302',
  postcodes: ['97300'],
  surface: 2476,
  population: 60580,
  level: 'town',
  geo: geo.cayenne,
};

export const kourou = {
  _id: 16,
  name: 'Kourou',
  insee: '97304',
  postcodes: ['97310'],
  surface: 230443,
  population: 26522,
  level: 'town',
  geo: geo.kourou,
};

export const guyane = {
  _id: 14,
  name: 'Guyane',
  insee: '973',
  level: 'region',
  children: [cayenne, kourou],
};

export const france = {
  _id: 2,
  name: 'France',
  level: 'country',
  children: [hautsDeFrance, ileDeFrance, rhoneAlpes, guyane],
};

export const territories: Territory[] = [
  belgique,
  france,
  hautsDeFrance,
  nord,
  lille,
  ileDeFrance,
  essonne,
  massy,
  palaiseau,
  orsay,
  rhoneAlpes,
  rhone,
  lyon,
  venissieux,
  guyane,
  cayenne,
  kourou,
];

export const territory_groups: CreateTerritoryGroupInterface[] = [
  {
    company_id: 1,
    name: 'Ile-De-France-Mobilité',
    contacts: {},
    address: {
      street: '39 bis-41 rue de Châteaudun',
      postcode: '75009 Paris',
      cedex: 'Paris',
      city: 'Paris',
      country: 'France',
    },
    selector: { _id: [2] },
  },
];
