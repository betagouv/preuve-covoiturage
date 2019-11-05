import { UserPatchInterface } from './common/interfaces/UserPatchInterface';
import { UserInterface } from './common/interfaces/UserInterface';

export interface ParamsInterface {
  _id: string;
  patch: UserPatchInterface;
}
// TODO : to migrate to update command
// email: string;
// firstname: string;
// lastname: string;
// phone?: string;

export interface ResultInterface extends UserInterface {}

export const configHandler = {
  service: 'user',
  method: 'patch',
};

export const signature = `${configHandler.service}:${configHandler.method}`;
