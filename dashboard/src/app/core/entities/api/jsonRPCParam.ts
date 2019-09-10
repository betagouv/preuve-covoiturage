export class JsonRPCParam {
  public id: number;
  public method: string;
  public jsonrpc: string;
  public params: any;

  constructor(method?: string, params?: any) {
    this.id = new Date().getTime();
    this.method = method ? method : '';
    this.jsonrpc = '2.0';
    this.params = params ? params : null;
  }
}
