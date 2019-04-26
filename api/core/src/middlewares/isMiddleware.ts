import { MiddlewareInterface } from '~/interfaces/MiddlewareInterface';
import { CallType } from '~/types/CallType';
import { ForbiddenException } from '~/exceptions/ForbiddenException';
import { InvalidParamsException } from '~/exceptions/InvalidParamsException';
import { reduceRoles } from '~/helpers/reducers/reduceRoles';

export function isMiddleware(...roles: string[]): MiddlewareInterface {
  return async (call: CallType, next: Function): Promise<void> => {
    const filtered: string[] = roles.filter(i => !!i);

    if (!filtered.length) {
      throw new InvalidParamsException('No role defined');
    }

    const { role, group } = call.context.user;

    const pass = filtered.reduce(reduceRoles(filtered, group, role), true);

    if (!pass) {
      throw new ForbiddenException('Role mismatch');
    }

    await next();
  };
}
