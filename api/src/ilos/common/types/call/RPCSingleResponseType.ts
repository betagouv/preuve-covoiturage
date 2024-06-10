import { ResultType } from "./ResultType.ts";
import { RPCErrorType } from "./RPCErrorType.ts";
import { IdType } from "./IdType.ts";

export type RPCSingleResponseType = {
  id: IdType;
  jsonrpc: string;
  result?: ResultType;
  error?: RPCErrorType;
} | void;
