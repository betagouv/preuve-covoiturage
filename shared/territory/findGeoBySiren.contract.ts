import { SingleResultInterface as GeoSingleResultInterface } from './listGeo.contract';

/**
 * Peut être un code siren d'une EPCI ou d'une AOM
 */
export interface ParamsInterface {
  siren: string;
}

export interface SingleResultInterface {
  reg_name: string;
  reg_siren: string;

  aom_name: string;
  aom_siren: string;

  epci_name: string;
  epci_siren: string;

  dep_name: string;
  dep_siren: string;

  coms: Array<GeoSingleResultInterface>;
}

export type ResultInterface = SingleResultInterface;

export const handlerConfig = {
  service: 'territory',
  method: 'findGeoBySiren',
} as const;
export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
