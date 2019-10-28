import { UserBaseInterface } from './UserBaseInterface';

export interface UserInterface extends UserBaseInterface {
  _id: string;
  permissions: string[];
  status: string;
  created_at: Date;
  updated_at: Date;
}
