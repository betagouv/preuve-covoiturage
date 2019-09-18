export class JsonRPCParam {
  public id: number;
  public method: string;
  public jsonrpc: string;
  public params: any;

  static createPatchParam(method: string, item: any, id: string): JsonRPCParam {
    const patch = { ...item };
    const param = { patch, _id: id ? id : item._id };
    delete patch._id;
    return new JsonRPCParam(method, param);
  }

  constructor(method?: string, params?: any) {
    this.id = new Date().getTime();
    this.method = method ? method : '';
    this.jsonrpc = '2.0';
    this.params = params ? params : null;
  }
}
