import { RPCException } from '../../exceptions/RPCException';

export function isAnRPCException(error: Error): error is RPCException {
  return (<RPCException>error).rpcError !== undefined;
}
