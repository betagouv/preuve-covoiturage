import { get, set } from 'lodash';
import { RPCSingleCallType } from '@ilos/common';

import { UserInterface } from '../shared/user/common/interfaces/UserInterface';

export function nestParams(doc: RPCSingleCallType, usr: UserInterface = null): RPCSingleCallType {
  const params = get(doc, 'params.params', get(doc, 'params', {}));
  const _context = get(doc, 'params._context', {});

  if (usr) set(_context, 'call.user', usr);

  return {
    id: doc.id,
    jsonrpc: doc.jsonrpc,
    method: doc.method,
    params: {
      params,
      _context,
    },
  };
}
