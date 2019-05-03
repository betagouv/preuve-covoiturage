import { CallType } from '~/types/CallType';

import { isMiddleware } from './isMiddleware';

/**
 * Check if user is admin
 * @export
 * @param {CallType} call
 * @param {Function} next
 * @returns
 */
export async function isAdminMiddleware(call: CallType, next: Function) {
  return isMiddleware('admin')(call, next);
}
