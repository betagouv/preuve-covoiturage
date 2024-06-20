import { RPCErrorType } from "../types/call/RPCErrorType.ts";

export abstract class RPCException extends Error {
  // @ts-expect-error
  rpcError: RPCErrorType;
  nolog?: boolean;
}
