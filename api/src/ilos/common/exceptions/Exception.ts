import { RPCErrorType } from "../types/call/RPCErrorType.ts";

export class Exception extends Error {
  rpcError?: RPCErrorType;
  nolog?: boolean;
  httpCode?: number;
}
