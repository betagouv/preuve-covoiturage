export interface ParamsInterface {
  _id: number;
}
export type ResultInterface = void;
export const configHandler = {
  service: 'territory',
  method: 'delete',
};
export const signature = `${configHandler.service}:${configHandler.method}`;
