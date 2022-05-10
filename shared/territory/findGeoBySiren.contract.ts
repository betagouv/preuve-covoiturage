export interface ParamsInterface {
  siren: string;
}

export type ResultInterface = Array<Object>;

export const handlerConfig = {
  service: 'territory',
  method: 'findGeoBySiren',
};
export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
