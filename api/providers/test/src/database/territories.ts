import * as geo from './geo';

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
  // account
}

export const belgique = {
  _id: 1,
  name: 'Belgique',
  insee: '99131',
  geo: geo.belgique,
};

export const lille = {
  _id: 5,
  name: 'Lille',
  insee: '59350',
  postcodes: ['59800', '59000', '59260', '59777', '59160'],
  surface: 3478.89,
  population: 232440,
  geo: geo.lille,
};

export const nord = {
  _id: 4,
  name: 'Nord',
  insee: '59',
  children: [lille],
};

export const hautsDeFrance = {
  _id: 3,
  name: 'Hauts-De-France',
  insee: '32',
  children: [nord],
};

export const massy = {
  _id: 7,
  name: 'Massy',
  insee: '91377',
  postcodes: ['91300'],
  surface: 942.26,
  population: 49924,
  geo: geo.massy,
};

export const palaiseau = {
  _id: 8,
  name: 'Palaiseau',
  insee: '91477',
  postcodes: ['91120'],
  surface: 1165.35,
  population: 34120,
  geo: geo.palaiseau,
};

export const orsay = {
  _id: 9,
  name: 'Orsay',
  insee: '91471',
  postcodes: ['91400'],
  surface: 743.53,
  population: 16678,
  geo: geo.orsay,
};

export const essonne = {
  _id: 17,
  name: 'Essonne',
  insee: '91',
  children: [massy, palaiseau, orsay],
};

export const ileDeFrance = {
  _id: 6,
  name: 'Ile-De-France',
  insee: '11',
  children: [essonne],
};

export const lyon = {
  _id: 12,
  name: 'Lyon',
  insee: '69123',
  postcodes: ['69001', '69002', '69003', '69004', '69005', '69006', '69007', '69008', '69009'],
  surface: 4797.51,
  population: 515695,
  geo: geo.lyon,
};

export const venissieux = {
  _id: 13,
  name: 'Vennisieux',
  insee: '69259',
  postcodes: ['69200'],
  surface: 1545.04,
  population: 65405,
  geo: geo.venissieux,
};

export const rhone = {
  _id: 11,
  name: 'Rhone',
  insee: '69',
  children: [lyon, venissieux],
};

export const rhoneAlpes = {
  _id: 10,
  name: 'Rhone-Alpes',
  insee: '84',
  children: [rhone],
};

export const cayenne = {
  _id: 15,
  name: 'Cayenne',
  insee: '97302',
  postcodes: ['97300'],
  surface: 2476.96,
  population: 60580,
  geo: geo.cayenne,
};

export const kourou = {
  _id: 16,
  name: 'Kourou',
  insee: '97304',
  postcodes: ['97310'],
  surface: 230443.59,
  population: 26522,
  geo: geo.kourou,
};

export const guyane = {
  _id: 14,
  name: 'Guyane',
  insee: '973',
  children: [cayenne, kourou],
};

export const france = {
  _id: 2,
  name: 'France',
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

export const operators = [{ name: 'Maxicovoit' }, { name: 'Megacovoit' }];

export const users = [];
export const policies = [];

export const trips = [{}];
