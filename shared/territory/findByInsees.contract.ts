export interface ParamsInterface {
  insees: string[];
}

export type ResultInterface = { _id: number; name: string }[];

export const handlerConfig = {
  service: 'territory',
  method: 'findByInsees',
};
export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
