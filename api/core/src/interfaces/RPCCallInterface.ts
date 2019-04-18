export interface RPCCallInterface {
    id?: string | number | null;
    jsonrpc: string,
    method: string,
    params?: any[] | object,
}