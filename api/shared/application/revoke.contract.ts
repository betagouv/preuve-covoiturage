export interface ParamsInterface {
  _id: string;
  owner_id?: string;
  owner_service?: string;
}

export type ResultInterface = void;

export type RepositoryInterface = Required<ParamsInterface>;

export const handlerConfig = {
  service: 'application',
  method: 'revoke',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
