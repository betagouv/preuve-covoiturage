import { CallType } from '~/types/CallType';

import { isMiddleware } from './isMiddleware';

export async function isAdminMiddleware(call: CallType, next: Function) {
  return isMiddleware('admin')(call, next);
}
