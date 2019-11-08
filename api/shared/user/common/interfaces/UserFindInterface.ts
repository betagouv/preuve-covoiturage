import { UserFullInterface } from './UserFullInterface';

export interface UserFindInterface extends UserFullInterface {
  permissions: string[];
  ui_status?: { [k: string]: any };
}
