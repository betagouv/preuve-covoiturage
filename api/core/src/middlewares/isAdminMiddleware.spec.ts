import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';

import { CallType } from '../types/CallType';
import { ContextType } from '../types/ContextType';
import { ParamsType } from '../types/ParamsType';
import { ResultType } from '../types/ResultType';
import { ForbiddenException } from '../exceptions/ForbiddenException';

import { isAdminMiddleware } from './isAdminMiddleware';

chai.use(chaiAsPromised);
const { expect } = chai;

// tslint:disable-next-line
const noop = () => { };

const callFactory = (group: string, role: string): CallType => ({
  method: 'test',
  context: <ContextType>{
    internal: true,
    transport: 'http',
    user: {
      group,
      role,
    },
  },
  params: <ParamsType>{},
  result: <ResultType>null,
});

describe('is middleware', () => {
  it('works: super admin', async () => {
    const call: CallType = callFactory('registry', 'admin');

    await expect(isAdminMiddleware(call, noop)).to.become(undefined);
  });

  it('works: aom admin', async () => {
    const call: CallType = callFactory('aom', 'admin');

    await expect(isAdminMiddleware(call, noop)).to.become(undefined);
  });

  it('works: operator admin', async () => {
    const call: CallType = callFactory('operator', 'admin');

    await expect(isAdminMiddleware(call, noop)).to.become(undefined);
  });

  it('fails: registry user', async () => {
    const call: CallType = callFactory('registry', 'user');

    await expect(isAdminMiddleware(call, noop)).to.be.rejectedWith(ForbiddenException);
  });

  it('fails: unknown', async () => {
    const call: CallType = callFactory('registry', 'unknown');

    await expect(isAdminMiddleware(call, noop)).to.be.rejectedWith(ForbiddenException);
  });
});
