import { ParamsType, RPCSingleCallType } from '@ilos/common';
import { UserInterface } from '@shared/user/common/interfaces/UserInterface';
import { injectContext } from './injectContext';

export function createRPCPayload(
  method: string,
  params: ParamsType,
  user?: Partial<UserInterface>,
  metadata?: any,
): RPCSingleCallType {
  return injectContext(
    {
      jsonrpc: '2.0',
      id: 1,
      method,
      params,
    },
    user,
    metadata,
  );
}
