import { UserBaseInterface } from './UserBaseInterface';

export interface UserStatusInterface extends UserBaseInterface {
  _id: string;
  status: string;
}
