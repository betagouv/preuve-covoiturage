import { UserIdInterface } from './common/interfaces/UserIdInterface';
import { UserPatchInterface } from './common/interfaces/UserPatchInterface';

export interface ParamsInterface {
  _id: string;
  patch: UserPatchInterface;
}

export interface ResultInterface extends UserIdInterface {}

export const configHandler = {
  service: 'user',
  method: 'patch',
};

export const signature = `${configHandler.service}:${configHandler.method}`;
