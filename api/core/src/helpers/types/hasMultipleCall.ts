import { RPCCallType } from '../../types/RPCCallType';
import { RPCSingleCallType } from '../../types/RPCSingleCallType';

export function hasMultipleCall(c: RPCCallType): c is RPCSingleCallType[] {
  return (<RPCCallType[]>c).forEach !== undefined;
}
