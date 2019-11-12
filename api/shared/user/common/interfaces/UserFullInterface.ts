import { UserBaseInterface } from './UserBaseInterface';

export interface UserFullInterface extends UserBaseInterface {
  _id: number;
  status: string;
  created_at: Date;
  updated_at: Date;
}
