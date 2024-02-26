import { RPCCallType, RPCSingleCallType } from '@ilos/common';

export function hasMultipleCall(c: RPCCallType): c is RPCSingleCallType[] {
  return (c as RPCCallType[]).forEach !== undefined;
}
