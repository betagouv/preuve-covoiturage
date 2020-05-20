import { OperatorInterface } from './OperatorInterface';

export interface OperatorDbInterface extends OperatorInterface {
  _id: number;
  uuid?: string;
  created_at?: Date;
  updated_at?: Date;
}
