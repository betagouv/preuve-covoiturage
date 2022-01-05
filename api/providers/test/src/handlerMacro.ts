import { ContextType, ServiceContainerInterface, NewableType } from '@ilos/common';
import { Macro, TestFn, ExecutionContext } from 'ava';

import { makeKernel, KernelTestFn } from './helpers';

interface HandlerConfigInterface {
  service: string;
  method: string;
}

type successCheck<R, C = any> = (params: R, t: ExecutionContext<C>) => Promise<void> | void;
type errorCheck<E = Error, C = any> = (params: E, t: ExecutionContext<C>) => Promise<void> | void;
type paramsBuilder<P, C = any> = (t: ExecutionContext<C>) => Promise<P> | P;

export function handlerMacro<ActionParams, ActionResult, ActionError extends Error = Error, TestContext = unknown>(
  anyTest: TestFn,
  serviceProviderCtor: NewableType<ServiceContainerInterface>,
  handlerConfig: HandlerConfigInterface,
): {
  test: TestFn<TestContext & KernelTestFn>;
  success: Macro<
    [
      ActionParams | paramsBuilder<ActionParams, TestContext & KernelTestFn>,
      Partial<ActionResult> | successCheck<ActionResult, TestContext & KernelTestFn>,
      Partial<ContextType>?,
    ],
    TestContext & KernelTestFn
  >;
  error: Macro<
    [
      ActionParams | paramsBuilder<ActionParams, TestContext & KernelTestFn>,
      string | errorCheck<ActionError, TestContext & KernelTestFn>,
      Partial<ContextType>?,
    ],
    TestContext & KernelTestFn
  >;
} {
  const test = anyTest as TestFn<TestContext & KernelTestFn>;

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
      ActionParams | paramsBuilder<ActionParams, TestContext & KernelTestFn>,
      Partial<ActionResult> | successCheck<ActionResult, TestContext & KernelTestFn>,
      Partial<ContextType>,
    ],
    TestContext & KernelTestFn
  > = async (
    t: ExecutionContext<TestContext & KernelTestFn>,
    params: ActionParams | paramsBuilder<ActionParams, TestContext & KernelTestFn>,
    response: Partial<ActionResult> | successCheck<ActionResult, TestContext & KernelTestFn>,
    currentContext: Partial<ContextType> = {},
  ) => {
    const context = {
      ...emptyContext,
      ...currentContext,
    };
    const finalParams =
      typeof params === 'function'
        ? await (params as paramsBuilder<ActionParams, TestContext & KernelTestFn>)(t)
        : params;

    const kernel = t.context.kernel;
    const result = await kernel.call<ActionParams, ActionResult>(
      `${handlerConfig.service}:${handlerConfig.method}`,
      finalParams,
      context,
    );
    t.log(`Calling ${handlerConfig.service}:${handlerConfig.method}`, { params: finalParams, context });
    if (typeof response === 'function') {
      await response(result, t);
    } else {
      t.deepEqual(result, response);
    }
  };
  success.title = (providedTitle = '', input, expected): string => `${providedTitle} ${input} = ${expected}`.trim();

  const error: Macro<
    [
      ActionParams | paramsBuilder<ActionParams, TestContext & KernelTestFn>,
      string | errorCheck<ActionError, TestContext & KernelTestFn>,
      Partial<ContextType>,
    ],
    TestContext & KernelTestFn
  > = async (
    t: ExecutionContext<TestContext & KernelTestFn>,
    params: ActionParams | paramsBuilder<ActionParams, TestContext & KernelTestFn>,
    message: string | errorCheck<ActionError, TestContext & KernelTestFn>,
    currentContext: Partial<ContextType> = {},
  ) => {
    const context = {
      ...emptyContext,
      ...currentContext,
    };
    const finalParams =
      typeof params === 'function'
        ? await (params as paramsBuilder<ActionParams, TestContext & KernelTestFn>)(t)
        : params;

    const kernel = t.context.kernel;
    const err = await t.throwsAsync<ActionError>(async () =>
      kernel.call<ActionParams>(`${handlerConfig.service}:${handlerConfig.method}`, finalParams, context),
    );
    t.log(err.message);
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
