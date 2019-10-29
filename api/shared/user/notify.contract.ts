export interface ParamsInterface {
  template: string;
  email: string;
  fullname: string;
  organization: string;
  link: string;
}

export type ResultInterface = void;

export const configHandler = {
  service: 'user',
  method: 'notify',
};

export const signature = `${configHandler.service}:${configHandler.method}`;
