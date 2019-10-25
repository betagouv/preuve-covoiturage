import { PositionInterface } from './PositionInterface';

export interface PersonInterface {
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

  start: PositionInterface;
  end: PositionInterface;
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
