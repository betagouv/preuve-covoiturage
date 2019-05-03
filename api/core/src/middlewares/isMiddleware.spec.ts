import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';

import { CallType } from '../types/CallType';
import { ContextType } from '../types/ContextType';
import { ParamsType } from '../types/ParamsType';
import { ResultType } from '../types/ResultType';
import { MiddlewareInterface } from '../interfaces/MiddlewareInterface';
import { ForbiddenException } from '../exceptions/ForbiddenException';
import { InvalidParamsException } from '../exceptions/InvalidParamsException';

import { isMiddleware } from './isMiddleware';

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
    const mw: MiddlewareInterface = isMiddleware('superAdmin');

    await expect(mw(call, noop)).to.become(undefined);
  });

  it('works: admin', async () => {
    const call: CallType = callFactory('operator', 'admin');
    const mw: MiddlewareInterface = isMiddleware('admin');

    await expect(mw(call, noop)).to.become(undefined);
  });

  it('works: user', async () => {
    const call: CallType = callFactory('aom', 'user');
    const mw: MiddlewareInterface = isMiddleware('user');

    await expect(mw(call, noop)).to.become(undefined);
  });

  it('works: aom', async () => {
    const call: CallType = callFactory('aom', 'admin');
    const mw: MiddlewareInterface = isMiddleware('admin');

    await expect(mw(call, noop)).to.become(undefined);
  });

  it('works: operator', async () => {
    const call: CallType = callFactory('operator', 'admin');
    const mw: MiddlewareInterface = isMiddleware('admin');

    await expect(mw(call, noop)).to.become(undefined);
  });

  it('works: registry', async () => {
    const call: CallType = callFactory('registry', 'admin');
    const mw: MiddlewareInterface = isMiddleware('admin');

    await expect(mw(call, noop)).to.become(undefined);
  });

  it('fails: unknown', async () => {
    const call: CallType = callFactory('registry', 'admin');
    const mw: MiddlewareInterface = isMiddleware('unknown');

    await expect(mw(call, noop)).to.be.rejectedWith(ForbiddenException);
  });

  it('fails: null', async () => {
    const call: CallType = callFactory('registry', 'admin');
    const mw: MiddlewareInterface = isMiddleware(null);

    await expect(mw(call, noop)).to.be.rejectedWith(InvalidParamsException);
  });

  it('fails: empty', async () => {
    const call: CallType = callFactory('registry', 'admin');
    const mw: MiddlewareInterface = isMiddleware();

    await expect(mw(call, noop)).to.be.rejectedWith(InvalidParamsException);
  });

  it('fails: undefined', async () => {
    const call: CallType = callFactory('registry', 'admin');
    const mw: MiddlewareInterface = isMiddleware(undefined);

    await expect(mw(call, noop)).to.be.rejectedWith(InvalidParamsException);
  });
});
