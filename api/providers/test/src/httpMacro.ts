import { ContextType, ParamsType, TransportInterface, ResultType } from '@ilos/common';
import test, { ExecutionContext, Macro } from 'ava';
import supert from 'supertest';

type transportCtorType = (type: string, ...opts: string[]) => Promise<TransportInterface>;

export interface HttpMacroContext {
  transport: TransportInterface;
  supertest: supert.SuperTest<supert.Test>;
  request: <P = ParamsType, R = ResultType>(method: string, params: P, context: Partial<ContextType>) => Promise<R>;
}

interface HttpMacroInterface<C = unknown> {
  before(): Promise<HttpMacroContext>;
  after(ctxt: HttpMacroContext): Promise<void>;
  query: Macro<[string, any, any, any], HttpMacroContext & C>; 
}

export function httpMacro<TestContext = unknown>(
  transportCtor: transportCtorType,
): HttpMacroInterface<TestContext> {

  async function before() {
    const transport = await transportCtor('http', '0');
    const supertest = supert(transport.getInstance());
    const request = async <P = ParamsType>(method: string, params: P, context: Partial<ContextType>) => {
      const mergedContext: ContextType = {
        call: { user: {}, ...context.call },
        channel: { service: '', ...context.channel },
      };

      const result = await supertest
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
    return {
      transport,
      supertest,
      request,
    }
  }

  async function after(ctxt: HttpMacroContext) {
   await ctxt.transport.down();
  }

  const query: Macro<[string, any, any, any], TestContext & HttpMacroContext> = test.macro({
    async exec(t: ExecutionContext<TestContext&HttpMacroContext>,
    method: string,
    params: any,
    context: any,
    result: any,
    ) {  
      const response = await t.context.request(method, params, context);
      t.like(response, result);
    },
    title(providedTitle = '', method: string) {
      return `${providedTitle}: calling ${method}`;
    }
  });
  
  return {
    query,
    before,
    after,
  };
}
