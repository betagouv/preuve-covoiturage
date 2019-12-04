import { IModel } from '~/core/entities/IModel';

export class JsonRPCParam<T = any> {
  public id: number;
  public method: string;
  public jsonrpc: string;
  public params: any;

  static createPatchParam(method: string, item: IModel): JsonRPCParam {
    const patch = { ...item };
    const param = { patch, _id: item._id };
    delete patch._id;
    return new JsonRPCParam(method, param);
  }

  constructor(method?: string, params?: T) {
    this.id = new Date().getTime();
    this.method = method ? method : '';
    this.jsonrpc = '2.0';
    this.params = params ? params : null;
  }
}
