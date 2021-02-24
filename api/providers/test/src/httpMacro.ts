import { ContextType, ParamsType, TransportInterface, ResultType } from '@ilos/common';
import { Macro, TestInterface, ExecutionContext } from 'ava';
import supertest from 'supertest';

type transportCtorType = (type: string, ...opts: string[]) => Promise<TransportInterface>;

interface HttpInterface {
  transport: TransportInterface;
  supertest: supertest.SuperTest<supertest.Test>;
  request: <P = ParamsType, R = ResultType>(method: string, params: P, context: Partial<ContextType>) => Promise<R>;
}

export function httpMacro<TestContext = unknown>(
  anyTest: TestInterface,
  transportCtor: transportCtorType,
): {
  test: TestInterface<TestContext & HttpInterface>;
  query: Macro<[string, any, any, any], TestContext & HttpInterface>;
} {
  const test = anyTest as TestInterface<TestContext & HttpInterface>;

  test.before(async (t) => {
    t.context.transport = await transportCtor('http', '0');
    t.context.supertest = supertest(t.context.transport.getInstance());
    t.context.request = async <P = ParamsType>(method: string, params: P, context: Partial<ContextType>) => {
      const mergedContext: ContextType = {
        call: { user: {}, ...context.call },
        channel: { service: '', ...context.channel },
      };

      const result = await t.context.supertest
        .post('/')
        .set('Accept', 'application/json')
        .set('Content-type', 'application/json')
        .send({
          id: 1,
          jsonrpc: '2.0',
          method,
          params: {
            params,
            _context: mergedContext,
          },
        });

      return result.body;
    };
  });

  test.after.always(async (t) => {
    await t.context.transport.down();
  });

  const query: Macro<[string, any, any, any], TestContext & HttpInterface> = async (
    t: ExecutionContext<TestContext & HttpInterface>,
    method: string,
    params: any,
    context: any,
    result: any,
  ) => {
    const response = await t.context.request(method, params, context);
    t.like(response, result);
  };
  query.title = (providedTitle = ''): string => `${providedTitle} boot`.trim();

  return {
    query,
    test,
  };
}
