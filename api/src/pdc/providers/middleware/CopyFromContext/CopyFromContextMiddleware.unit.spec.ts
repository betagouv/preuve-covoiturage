import { ContextType, ParamsType, ResultType } from '@/ilos/common/index.ts';
import { assertEquals, assert, assertFalse, assertThrows, assertObjectMatch, afterEach, beforeEach, afterAll, beforeAll, describe, it } from '@/dev_deps.ts';
import { CopyFromContextMiddleware } from './CopyFromContextMiddleware.ts';

const middleware = new CopyFromContextMiddleware();

const TERRITORY_ID = 40;

const callFactory = (): { method: string; context: ContextType; params: ParamsType; result: ResultType } => ({
  method: 'trip.export',
  context: {
    channel: {
      service: '',
      transport: 'node:http',
    },
    call: {
      user: {
        territory_id: TERRITORY_ID,
      },
    },
  },
  params: null,
  result: null,
});

const nextReturnNewParams: Function = (newParams, context) => {
  return newParams;
};

it('Copy from context middleware: should not copy territory context if params set and preserve true', async (t) => {
  const mappings: [string, string, boolean] = ['call.user.territory_id', 'territory_id', true];
  const { context } = callFactory();

  const params = { territory_id: [41, 42] };
  assertObjectMatch(await middleware.process(params, context, nextReturnNewParams, mappings), params);
});

it('Copy from context middleware: should copy territory context if params not set or empty', async (t) => {
  const mappings: [string, string, boolean] = ['call.user.territory_id', 'territory_id', true];
  const { context } = callFactory();

  const params = {};
  assertObjectMatch(await middleware.process(params, context, nextReturnNewParams, mappings), { territory_id: TERRITORY_ID });
});
