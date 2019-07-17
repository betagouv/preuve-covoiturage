export class JsonRPCParam {
  public _id: string;
  public method: string;
  public jsonrpc: string;
  public params: any;

  constructor(method?: string, params?: any) {
    this._id = '1';
    this.method = method ? method : '';
    this.jsonrpc = '2.0';
    this.params = params ? params : null;
  }
}
