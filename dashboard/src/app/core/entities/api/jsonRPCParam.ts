export class JsonRPCParam {
  public _id: string;
  public method: string;
  public jsonrpc: string;
  public params: any;

  constructor() {
    this._id = '1';
    this.method = '';
    this.jsonrpc = '2.0';
    this.params = null;
  }
}
