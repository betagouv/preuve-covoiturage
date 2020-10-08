export type ParamsInterface = { territory_id: number } | { operator_id: number };

export type ResultInterface = void;

export const handlerConfig = {
  service: 'user',
  method: 'deleteAssociated',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
