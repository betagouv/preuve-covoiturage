import { ConfigInterfaceResolver } from '@/ilos/common/index.ts';
import anyTest, { TestFn } from 'ava';
import sinon, { SinonFakeTimers, SinonStub } from 'sinon';
import { CreateCastParamsInterface, ParamsInterface, createCastParamsHelper } from './createCastParamsHelper.ts';

interface Context {
  configStub: SinonStub;
  castParams: CreateCastParamsInterface<ParamsInterface>;
  clock: SinonFakeTimers;
  origin: Date;
  start_at_max: Date;
  end_at_max: Date;
}

const test = anyTest as TestFn<Context>;

test.before((t) => {
  t.context.clock = sinon.useFakeTimers(new Date('2021-06-01T00:00:00Z'));
});
test.beforeEach((t) => {
  const configIR = new (class extends ConfigInterfaceResolver {})();
  t.context.castParams = createCastParamsHelper<ParamsInterface>(configIR);
  const configStub = sinon.stub(configIR, 'get');
  configStub.returns(6);
  t.context.configStub = configStub;
  t.context.origin = new Date('2019-01-01T00:00:00+0100');
  t.context.start_at_max = new Date(new Date().getTime() - 7 * 86400000);
  t.context.end_at_max = new Date(new Date().getTime() - 6 * 86400000);
});

test.afterEach((t) => {
  t.context.clock.restore();
});

test('regular dates 6 months ago', (t) => {
  const src: Required<ParamsInterface> = {
    start_at: new Date('2021-01-01T00:00:00Z'),
    end_at: new Date('2021-02-01T00:00:00Z'),
    positions: [],
  };

  t.deepEqual(t.context.castParams(src), src);
});

test('missing start_at defaults to origin time', (t) => {
  const src: ParamsInterface = {
    end_at: new Date('2021-02-01T00:00:00Z'),
  };

  t.deepEqual(t.context.castParams(src), {
    start_at: t.context.origin,
    end_at: new Date('2021-02-01T00:00:00Z'),
    positions: [],
  });
});

test('missing end_at defaults to end_at_max time', (t) => {
  const src: ParamsInterface = {
    start_at: new Date('2021-01-01T00:00:00Z'),
  };

  t.deepEqual(t.context.castParams(src), {
    start_at: new Date('2021-01-01T00:00:00Z'),
    end_at: t.context.end_at_max,
    positions: [],
  });
});

test('start_at and end_at must be older than 6 days', (t) => {
  const src: ParamsInterface = {
    start_at: new Date('2021-06-01T00:00:00Z'),
    end_at: new Date('2021-06-02T00:00:00Z'),
  };

  t.deepEqual(t.context.castParams(src), {
    start_at: t.context.start_at_max,
    end_at: t.context.end_at_max,
    positions: [],
  });
});

test('end_at must be older than 6 days', (t) => {
  const src: ParamsInterface = {
    start_at: new Date('2021-01-01T00:00:00Z'),
    end_at: new Date('2021-06-01T00:00:00Z'),
  };

  t.deepEqual(t.context.castParams(src), {
    start_at: new Date('2021-01-01T00:00:00Z'),
    end_at: new Date('2021-05-26T00:00:00Z'),
    positions: [],
  });
});

test('start_at must be older than end_at, otherwise we set a 24 hours slot', (t) => {
  const src: ParamsInterface = {
    start_at: new Date('2021-01-03T00:00:00Z'),
    end_at: new Date('2021-01-02T00:00:00Z'),
  };

  t.deepEqual(t.context.castParams(src), {
    start_at: new Date('2021-01-01T00:00:00Z'),
    end_at: new Date('2021-01-02T00:00:00Z'),
    positions: [],
  });
});
