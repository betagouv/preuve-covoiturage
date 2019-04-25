import { MiddlewareInterface } from "~/interfaces/MiddlewareInterface";
import { CallType } from "~/types/CallType";
import { ForbiddenException } from "~/Exceptions/ForbiddenException";

export function CanMiddleware(methodPerms: string[] = []) {
    return async <MiddlewareInterface>(call: CallType, next: Function) => {
        const { permissions } = call.context.user;

        if (methodPerms.length !== permissions.length) {
            throw new ForbiddenException('Invalid permissions');
        }

        const pass = methodPerms.reduce((p, c) => {
            return p && (permissions || []).indexOf(c) > -1;
        }, true);

        if (!pass) {
            throw new ForbiddenException('Invalid permissions');
        }

        await next();
    }
}
