export interface ParamsInterface {
  uuid: string;
  owner_id: number;
  owner_service?: string;
}

export type ResultInterface = void;

export type RepositoryInterface = Required<ParamsInterface>;

export const handlerConfig = {
  service: 'application',
  method: 'revoke',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
