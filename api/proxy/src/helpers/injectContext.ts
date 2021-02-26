import { RPCSingleCallType } from '@ilos/common';

import { UserInterface } from '../shared/user/common/interfaces/UserInterface';
import { castContext } from './castContext';

export function injectContext(
  doc: RPCSingleCallType,
  user?: Partial<UserInterface>,
  metadata?: any,
): RPCSingleCallType {
  return {
    id: doc.id,
    jsonrpc: doc.jsonrpc,
    method: doc.method,
    params: {
      params: doc.params,
      _context: castContext(user, metadata),
    },
  };
}
