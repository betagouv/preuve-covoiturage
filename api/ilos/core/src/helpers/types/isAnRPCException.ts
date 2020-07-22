import { RPCException } from '@ilos/common';

export function isAnRPCException(error: Error): error is RPCException {
  return (error as RPCException).rpcError !== undefined;
}
