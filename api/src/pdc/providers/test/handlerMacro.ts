import { assertEquals, assertRejects } from "@/dev_deps.ts";
import { ContextType } from "@/ilos/common/index.ts";
import { KernelContext } from "./helpers.ts";

interface HandlerConfigInterface {
  service: string;
  method: string;
}

const emptyContext: ContextType = {
  call: {
    user: {},
  },
  channel: {
    service: "",
  },
};

export async function assertSuccessHandler<P = unknown, R = unknown>(
  context: KernelContext,
  handlerConfig: HandlerConfigInterface,
  params: P,
  response: R,
  currentContext = {},
) {
  const callContext = {
    ...emptyContext,
    ...currentContext,
  };
  const result = await context.kernel.call<P, R>(
    `${handlerConfig.service}:${handlerConfig.method}`,
    params,
    callContext,
  );

  assertEquals(result, response);
}

export async function assertErrorHandler<P = unknown, R = unknown>(
  context: KernelContext,
  handlerConfig: HandlerConfigInterface,
  params: P,
  response: R,
  currentContext = {},
) {
  const callContext = {
    ...emptyContext,
    ...currentContext,
  };
  await assertRejects(async () =>
    await context.kernel.call<P, R>(
      `${handlerConfig.service}:${handlerConfig.method}`,
      params,
      callContext,
    )
  );
}
