import { Groups } from '~/core/enums/user/groups';
import { Roles } from '~/core/enums/user/roles';
export interface ProfileInterface {
  email: string;
  lastname: string;
  firstname: string;
  phone: string;
}

export interface UserInterface {
  _id: number;
  email: string;
  lastname: string;
  firstname: string;
  phone: string;
  group: Groups;
  role: Roles;
  operator_id?: number;
  territory_id?: number;
  permissions: string[];
}
