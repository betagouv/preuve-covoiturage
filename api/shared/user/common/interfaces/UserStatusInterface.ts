import { UserBaseInterface } from './UserBaseInterface';

export interface UserStatusInterface extends UserBaseInterface {
  _id: number;
  status: string;
}
