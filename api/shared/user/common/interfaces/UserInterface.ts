import { UserBaseInterface } from './UserBaseInterface';

export interface UserInterface extends UserBaseInterface {
  _id: number;
  permissions: string[];
  status: string;
  created_at: Date;
  updated_at: Date;
}
