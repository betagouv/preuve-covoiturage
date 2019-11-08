export interface ParamsInterface {
  _id: number;
}
export type ResultInterface = void;
export const handlerConfig = {
  service: 'territory',
  method: 'delete',
};
export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
