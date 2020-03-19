import { ContextType, ServiceContainerInterface, NewableType } from '@ilos/common';
import { Macro, TestInterface, ExecutionContext } from 'ava';

import { makeKernel, KernelTestInterface } from './helpers';

interface HandlerConfigInterface {
  service: string;
  method: string;
}

type successCheck<R, C = any> = (params: R, t: ExecutionContext<C>) => Promise<void> | void;
type errorCheck<E = Error, C = any> = (params: E, t: ExecutionContext<C>) => Promise<void> | void;
type paramsBuilder<P, C = any> = (t: ExecutionContext<C>) => Promise<P> | P;

export function handlerMacro<ActionParams, ActionResult, ActionError extends Error = Error, TestContext = unknown>(
  anyTest: TestInterface,
  serviceProviderCtor: NewableType<ServiceContainerInterface>,
  handlerConfig: HandlerConfigInterface,
): {
  test: TestInterface<TestContext & KernelTestInterface>;
  success: Macro<
    [
      ActionParams | paramsBuilder<ActionParams, TestContext & KernelTestInterface>,
      Partial<ActionResult> | successCheck<ActionResult, TestContext & KernelTestInterface>,
      Partial<ContextType>?,
    ],
    TestContext & KernelTestInterface
  >;
  error: Macro<
    [
      ActionParams | paramsBuilder<ActionParams, TestContext & KernelTestInterface>,
      string | errorCheck<ActionError, TestContext & KernelTestInterface>,
      Partial<ContextType>?,
    ],
    TestContext & KernelTestInterface
  >;
} {
  const test = anyTest as TestInterface<TestContext & KernelTestInterface>;

  test.before(async (t) => {
    t.context.kernel = makeKernel(serviceProviderCtor);
    await t.context.kernel.bootstrap();
  });

  test.after.always(async (t) => {
    await t.context.kernel.shutdown();
  });

  const emptyContext = {
    call: {
      user: {},
    },
    channel: {
      service: '',
    },
  };

  const success: Macro<
    [
      ActionParams | paramsBuilder<ActionParams, TestContext & KernelTestInterface>,
      Partial<ActionResult> | successCheck<ActionResult, TestContext & KernelTestInterface>,
      Partial<ContextType>,
    ],
    TestContext & KernelTestInterface
  > = async (
    t: ExecutionContext<TestContext & KernelTestInterface>,
    params: ActionParams | paramsBuilder<ActionParams, TestContext & KernelTestInterface>,
    response: Partial<ActionResult> | successCheck<ActionResult, TestContext & KernelTestInterface>,
    currentContext: Partial<ContextType> = {},
  ) => {
    const context = {
      ...emptyContext,
      ...currentContext,
    };
    const finalParams =
      typeof params === 'function'
        ? await (params as paramsBuilder<ActionParams, TestContext & KernelTestInterface>)(t)
        : params;

    const kernel = t.context.kernel;
    const result = await kernel.call<ActionParams, ActionResult>(
      `${handlerConfig.service}:${handlerConfig.method}`,
      finalParams,
      context,
    );
    if (typeof response === 'function') {
      await response(result, t);
    } else {
      t.deepEqual(result, response);
    }
  };
  success.title = (providedTitle = '', input, expected): string => `${providedTitle} ${input} = ${expected}`.trim();

  const error: Macro<
    [
      ActionParams | paramsBuilder<ActionParams, TestContext & KernelTestInterface>,
      string | errorCheck<ActionError, TestContext & KernelTestInterface>,
      Partial<ContextType>,
    ],
    TestContext & KernelTestInterface
  > = async (
    t: ExecutionContext<TestContext & KernelTestInterface>,
    params: ActionParams | paramsBuilder<ActionParams, TestContext & KernelTestInterface>,
    message: string | errorCheck<ActionError, TestContext & KernelTestInterface>,
    currentContext: Partial<ContextType> = {},
  ) => {
    const context = {
      ...emptyContext,
      ...currentContext,
    };
    const finalParams =
      typeof params === 'function'
        ? await (params as paramsBuilder<ActionParams, TestContext & KernelTestInterface>)(t)
        : params;

    const kernel = t.context.kernel;
    const err = await t.throwsAsync<ActionError>(async () =>
      kernel.call<ActionParams>(`${handlerConfig.service}:${handlerConfig.method}`, finalParams, context),
    );
    t.log(err);
    if (typeof message === 'function') {
      await message(err, t);
    } else {
      t.is(err.message, message);
    }
  };

  error.title = (providedTitle = '', input, expected): string => `${providedTitle} ${input} = ${expected}`.trim();

  return {
    success,
    error,
    test,
  };
}
