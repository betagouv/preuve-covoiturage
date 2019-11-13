import { UserPatchInterface } from './common/interfaces/UserPatchInterface';
import { UserInterface } from './common/interfaces/UserInterface';

export interface ParamsInterface {
  _id: number;
  patch: UserPatchInterface;
}
// TODO : to migrate to update command
// email: string;
// firstname: string;
// lastname: string;
// phone?: string;

export interface ResultInterface extends UserInterface {}

export const handlerConfig = {
  service: 'user',
  method: 'patch',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
