import { assertEquals, supertest as spt, SuperTestAgent } from "@/dev_deps.ts";
import {
  ContextType,
  NewableType,
  ParamsType,
  ServiceContainerInterface,
  TransportInterface,
} from "@/ilos/common/index.ts";
import { Bootstrap } from "@/ilos/framework/index.ts";
import { makeKernelCtor } from "./helpers.ts";

export interface HttpContext {
  transport: TransportInterface;
  supertest: SuperTestAgent;
  request: <P = ParamsType, R = any>(
    method: string,
    params: P,
    context: Partial<ContextType>,
  ) => Promise<R>;
}

interface HttpMacroInterface {
  before(): Promise<HttpContext>;
  after(ctx: HttpContext): Promise<void>;
}

export function makeHttpBeforeAfter(
  serviceProviderCtor: NewableType<ServiceContainerInterface>,
): HttpMacroInterface {
  async function before() {
    const kernel = makeKernelCtor(serviceProviderCtor);
    const bootstrap = Bootstrap.create({ kernel: () => kernel });
    const transport = await bootstrap.boot("http", "0");
    const supertest = spt(transport.getInstance());
    const request = async <P = ParamsType, R = unknown>(
      method: string,
      params: P,
      context: Partial<ContextType>,
    ): Promise<R> => {
      const mergedContext: ContextType = {
        call: { user: {}, ...context.call },
        channel: { service: "", ...context.channel },
      };

      const result = await supertest
        .post("/")
        .set("Accept", "application/json")
        .set("Content-type", "application/json")
        .send({
          id: 1,
          jsonrpc: "2.0",
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
    };
  }

  async function after(ctx: HttpContext) {
    await ctx.transport.down();
  }

  return {
    before,
    after,
  };
}

export async function assertHttpCall(
  ctx: HttpContext,
  method: string,
  params: unknown,
  result: unknown,
  context: Partial<ContextType> = {},
) {
  const response = await ctx.request(method, params, context);
  assertEquals(response, result);
}
