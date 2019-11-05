export interface ParamsInterface {
  template: string;
  templateId: string;
  email: string;
  fullname: string;
  templateId?: string;
  organization?: string;
  link?: string;
}

export type ResultInterface = void;

export const configHandler = {
  service: 'user',
  method: 'notify',
};

export const signature = `${configHandler.service}:${configHandler.method}`;
