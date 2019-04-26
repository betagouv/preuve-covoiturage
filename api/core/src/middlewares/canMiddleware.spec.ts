import { describe } from 'mocha';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { CallType } from '~/types/CallType';
import { ContextType } from '~/types/ContextType';
import { ParamsType } from '~/types/ParamsType';
import { ResultType } from '~/types/ResultType';
import { MiddlewareInterface } from '~/interfaces/MiddlewareInterface';
import { ForbiddenException } from '~/exceptions/ForbiddenException';

import { canMiddleware } from './canMiddleware';

chai.use(chaiAsPromised);
const { expect } = chai;

// tslint:disable-next-line
const noop = () => { };

const callFactory = (permissions: string[]): CallType => ({
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
});

describe('can middleware', () => {
  it('works: matching 1 permission', async () => {
    const permissions: string[] = ['test.ok'];
    const call: CallType = callFactory(permissions);
    const mw: MiddlewareInterface = canMiddleware(permissions);

    await expect(mw(call, noop)).to.become(undefined);
  });

  it('works: matching all permissions', async () => {
    const permissions: string[] = ['test.perm1', 'test.perm2'];
    const call: CallType = callFactory(permissions);
    const mw: MiddlewareInterface = canMiddleware(permissions);

    await expect(mw(call, noop)).to.become(undefined);
  });

  it('works: no method permissions', async () => {
    const permissions: string[] = ['test.ok', 'whatever'];
    const call: CallType = callFactory(permissions);
    const mw: MiddlewareInterface = canMiddleware();

    await expect(mw(call, noop)).to.be.become(undefined);
  });

  it('fails: no user permissions', async () => {
    const call: CallType = callFactory([]);
    const mw: MiddlewareInterface = canMiddleware(['test.ok']);

    await expect(mw(call, noop)).to.be.rejectedWith(ForbiddenException);
  });

  it('fails: different permission', async () => {
    const permissions: string[] = ['test.ok'];
    const call: CallType = callFactory(permissions);
    const mw: MiddlewareInterface = canMiddleware(['test.not-ok']);

    await expect(mw(call, noop)).to.be.rejectedWith(ForbiddenException);
  });

  it('fails: not matching all permissions', async () => {
    const permissions: string[] = ['test.perm1', 'test.perm2'];
    const call: CallType = callFactory(permissions);
    const mw: MiddlewareInterface = canMiddleware(['test.perm1']);

    await expect(mw(call, noop)).to.be.rejectedWith(ForbiddenException);
  });

  it('fails: same length, different perms', async () => {
    const permissions: string[] = ['test.perm1', 'test.perm3'];
    const call: CallType = callFactory(permissions);
    const mw: MiddlewareInterface = canMiddleware(['test.perm1', 'test.perm2']);

    await expect(mw(call, noop)).to.be.rejectedWith(ForbiddenException);
  });
});
