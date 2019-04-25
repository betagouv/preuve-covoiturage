import { describe } from 'mocha';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { CanMiddleware } from './CanMiddleware';
import { CallType } from '~/types/CallType';
import { ContextType } from '~/types/ContextType';
import { ParamsType } from '~/types/ParamsType';
import { ResultType } from '~/types/ResultType';
import { MiddlewareInterface } from '~/interfaces/MiddlewareInterface';
import { ForbiddenException } from '~/Exceptions/ForbiddenException';

chai.use(chaiAsPromised);
const { expect } = chai;

const noop = () => { };

const callFactory = (permissions: string[]): CallType => {
    return {
        method: 'test',
        context: <ContextType>{
            internal: true,
            transport: 'http',
            user: {
                permissions,
            },
        },
        params: <ParamsType>{},
        result: <ResultType>null,
    }
}

describe('can middleware', () => {
    it('works: matching 1 permission', async () => {
        const permissions: string[] = ['test.ok'];
        const call: CallType = callFactory(permissions);
        const mw: MiddlewareInterface = CanMiddleware(permissions);

        await expect(mw(call, noop)).to.become(undefined);
    })

    it('works: matching all permissions', async () => {
        const permissions: string[] = ['test.perm1', 'test.perm2'];
        const call: CallType = callFactory(permissions);
        const mw: MiddlewareInterface = CanMiddleware(permissions);

        await expect(mw(call, noop)).to.become(undefined);
    })

    it('fails: different permission', async () => {
        const permissions: string[] = ['test.ok'];
        const call: CallType = callFactory(permissions);
        const mw: MiddlewareInterface = CanMiddleware(['test.not-ok']);

        await expect(mw(call, noop)).to.be.rejectedWith(ForbiddenException);
    })

    it('fails: not matching all permissions', async () => {
        const permissions: string[] = ['test.perm1', 'test.perm2'];
        const call: CallType = callFactory(permissions);
        const mw: MiddlewareInterface = CanMiddleware(['test.perm1']);

        await expect(mw(call, noop)).to.be.rejectedWith(ForbiddenException);
    })

    it('fails: same length, different perms', async () => {
        const permissions: string[] = ['test.perm1', 'test.perm3'];
        const call: CallType = callFactory(permissions);
        const mw: MiddlewareInterface = CanMiddleware(['test.perm1', 'test.perm2']);

        await expect(mw(call, noop)).to.be.rejectedWith(ForbiddenException);
    })
});
