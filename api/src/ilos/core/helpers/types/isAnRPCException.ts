import { Exception } from "@/ilos/common/index.ts";

export function isAnRPCException(error: Error): error is Exception {
  return (error as Exception).rpcError !== undefined;
}
