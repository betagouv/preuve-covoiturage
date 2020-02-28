export interface ParamsInterface {
  _id: number;
}

export type ResultInterface = boolean;

export const handlerConfig = {
  service: 'user',
  method: 'sendInvitationEmail',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
