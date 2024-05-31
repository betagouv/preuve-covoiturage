import { INSEECode, PerimeterType } from '../../geo/shared/Perimeter.ts';
import { Feature } from 'geojson';

export interface SingleResultInterface {
  type: PerimeterType;
  code: INSEECode;
  premiere_campagne: string;
  budget_incitations: string;
  date_debut: string;
  date_fin: string;
  conducteur_montant_max_par_passager: string;
  conducteur_montant_max_par_mois: string;
  conducteur_montant_min_par_passager: string;
  conducteur_trajets_max_par_mois: string;
  passager_trajets_max_par_mois: string;
  passager_gratuite: string;
  passager_eligible_gratuite: string;
  passager_reduction_ticket: string;
  passager_eligibilite_reduction: string;
  passager_montant_ticket: string;
  zone_sens_des_trajets: string;
  zone_exclusion: string;
  si_zone_exclue_liste: string;
  autre_exclusion: string;
  trajet_longueur_min: string;
  trajet_longueur_max: string;
  trajet_classe_de_preuve: string;
  operateurs: string;
  autres_informations: string;
  geom: Feature;
}

export type ResultInterface = SingleResultInterface[];

export interface ParamsInterface {
  code?: INSEECode;
  type?: PerimeterType; //type de territoire selectionné
  year?: number;
}

export const handlerConfig = {
  service: 'observatory',
  method: 'campaigns',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
