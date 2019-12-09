import { PositionInterface } from './PositionInterface';
import { IdentityInterface } from './IdentityInterface';

export interface PersonInterface {
  is_driver?: boolean;
  identity: IdentityInterface;
  operator_class?: string;
  journey_id?: string;
  operator_id?: number;

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
    siret: string;
    amount: number;
  }[];

  calc_distance?: number;
  calc_duration?: number;
}
