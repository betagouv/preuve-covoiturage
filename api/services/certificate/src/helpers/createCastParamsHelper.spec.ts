import { ConfigInterfaceResolver } from '@ilos/common';
import anyTest, { TestInterface } from 'ava';
import sinon, { SinonFakeTimers, SinonStub } from 'sinon';
import { CreateCastParamsInterface, ParamsInterface, createCastParamsHelper } from './createCastParamsHelper';

interface Context {
  configStub: SinonStub;
  castParams: CreateCastParamsInterface<ParamsInterface>;
  clock: SinonFakeTimers;
  origin: Date;
  start_at_max: Date;
  end_at_max: Date;
}

const test = anyTest as TestInterface<Partial<Context>>;

test.beforeEach((t) => {
  const configIR = new (class extends ConfigInterfaceResolver {})();
  const castParams = createCastParamsHelper(configIR);
  const configStub = sinon.stub(configIR, 'get');
  configStub.returns(6);

  const clock = sinon.useFakeTimers(new Date('2021-06-01T00:00:00Z'));
  const origin = new Date('2019-01-01T00:00:00+0100');
  const start_at_max = new Date(new Date().getTime() - 7 * 86400000);
  const end_at_max = new Date(new Date().getTime() - 6 * 86400000);

  t.context = { configStub, castParams, clock, origin, start_at_max, end_at_max };
});

test.afterEach((t) => {
  t.context.clock.restore();
});

test('regular dates 6 months ago', (t) => {
  const src: ParamsInterface = {
    start_at: new Date('2021-01-01T00:00:00Z'),
    end_at: new Date('2021-02-01T00:00:00Z'),
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
  });
});

test('missing end_at defaults to end_at_max time', (t) => {
  const src: ParamsInterface = {
    start_at: new Date('2021-01-01T00:00:00Z'),
  };

  t.deepEqual(t.context.castParams(src), {
    start_at: new Date('2021-01-01T00:00:00Z'),
    end_at: t.context.end_at_max,
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
  });
});
