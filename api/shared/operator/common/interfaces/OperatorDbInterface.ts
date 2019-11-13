import { OperatorInterface } from './OperatorInterface';

export interface OperatorDbInterface extends OperatorInterface {
  _id: number;
  created_at: Date;
  updated_at: Date;
}
