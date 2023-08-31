import { INSEECode, PerimeterType } from '../../geo/shared/Perimeter';
import { Feature } from 'geojson';

export interface SingleResultInterface {
  id_lieu: string;
  nom_lieu: string;
  com_lieu: string;
  type: string;
  date_maj: Date;
  nbre_pl: number;
  nbre_pmr: number;
  duree: number;
  horaires: string;
  proprio: string;
  lumiere: boolean;
  geom: Feature;
}

export type ResultInterface = SingleResultInterface[];

export interface ParamsInterface {
  type: PerimeterType; //type de territoire selectionné
  code: INSEECode; //code insee du territoire observé
}

export const handlerConfig = {
  service: 'observatory',
  method: 'airesCovoiturage',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
