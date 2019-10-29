import { ResultInterface as ResultV2Interface } from './create.contract';

interface PositionLegacyInterface {
  country?: string;
  insee?: string;
  lon?: number;
  lat?: number;
  literal?: string;
  postcodes?: string[];
  town?: string;
}

interface PersonLegacyInterface {
  is_driver?: boolean;
  identity: {
    phone: string;
    firstname?: string;
    lastname?: string;
    email?: string;
    company?: string;
    travel_pass?: {
      name: string;
      user_id: string;
    };
    over_18?: boolean | null;
  };
  operator_class?: string;
  journey_id?: string;
  operator_id?: string;

  start: PositionLegacyInterface;
  end: PositionLegacyInterface;
  distance?: number;
  duration?: number;

  seats?: number;
  contribution?: number;
  revenue?: number;
  expense: number;
  incentives?: {
    index: number;
    amount: number;
    siret: string;
  }[];

  payments?: {
    pass_type: string;
    amount: number;
  }[];

  calc_distance?: number;
  calc_duration?: number;
}

export interface ParamsInterface {
  journey_id: string;
  operator_journey_id: string;
  operator_class: string;
  operator_id: string;
  passenger?: PersonLegacyInterface;
  driver?: PersonLegacyInterface;
}

export type ResultInterface = ResultV2Interface;
export const configHandler = {
  service: 'acquisition',
  method: 'createLegacy',
};
export const signature = `${configHandler.service}:${configHandler.method}`;
