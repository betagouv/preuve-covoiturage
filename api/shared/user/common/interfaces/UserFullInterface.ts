import { UserBaseInterface } from './UserBaseInterface';

export interface UserFullInterface extends UserBaseInterface {
  _id: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}
