import { SingleResultInterface as GeoSingleResultInterface } from './listGeo.contract';

/**
 * Peut être un code siren d'une EPCI ou d'une AOM
 */
export interface ParamsInterface {
  siren: string;
}

export interface SingleResultInterface {
  aom_siret: string;
  aom_name: string;
  epci_name: string;
  epci_siret: string;
  coms: Array<GeoSingleResultInterface>;
}

export type ResultInterface = SingleResultInterface;

export const handlerConfig = {
  service: 'territory',
  method: 'findGeoBySiren',
};
export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
