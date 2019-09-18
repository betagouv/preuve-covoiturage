export interface JsonRPCResponse {
  id: number;
  error: any;
  result: { meta: string; data: any[] };
}
