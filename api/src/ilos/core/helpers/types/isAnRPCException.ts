import { RPCException } from '/ilos/common/index.ts';

export function isAnRPCException(error: Error): error is RPCException {
  return (error as RPCException).rpcError !== undefined;
}
