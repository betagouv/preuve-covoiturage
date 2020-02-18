import { describe } from 'mocha';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { ParamsType, ContextType, ResultType, InvalidParamsException, ForbiddenException } from '@ilos/common';

import { PermissionMiddleware } from './PermissionMiddleware';

chai.use(chaiAsPromised);
const { expect } = chai;

const middleware = new PermissionMiddleware();

async function noop(params, context) {
  return;
}

const callFactory = (permissions: string[]) => ({
  method: 'test',
  context: <ContextType>{
    channel: {
      service: '',
      transport: 'http',
    },
    call: {
      user: {
        permissions,
      },
    },
  },
  params: <ParamsType>{},
  result: <ResultType>null,
});

describe('Permission middleware', () => {
  it('works: matching 1 permission', async () => {
    const permissions: string[] = ['test.ok'];
    const { params, context } = callFactory(permissions);

    await expect(middleware.process(params, context, noop, permissions)).to.become(undefined);
  });

  it('works: matching all permissions', async () => {
    const permissions: string[] = ['test.ok'];
    const { params, context } = callFactory(permissions);

    await expect(middleware.process(params, context, noop, permissions)).to.become(undefined);
  });

  it('works: no method permissions', async () => {
    const permissions: string[] = ['test.ok'];
    const { params, context } = callFactory(permissions);

    await expect(middleware.process(params, context, noop, [])).to.be.rejectedWith(InvalidParamsException);
  });

  it('fails: no user permissions', async () => {
    const { params, context } = callFactory([]);
    await expect(middleware.process(params, context, noop, ['not-ok'])).to.be.rejectedWith(ForbiddenException);
  });

  it('fails: different permission', async () => {
    const permissions: string[] = ['test.ok'];
    const { params, context } = callFactory(permissions);
    await expect(middleware.process(params, context, noop, ['test.not-ok'])).to.be.rejectedWith(ForbiddenException);
  });

  it('fails: not matching all permissions', async () => {
    const permissions: string[] = ['test.perm1'];
    const { params, context } = callFactory(permissions);
    await expect(middleware.process(params, context, noop, ['test.perm1', 'test.perm2'])).to.be.rejectedWith(
      ForbiddenException,
    );
  });
});
