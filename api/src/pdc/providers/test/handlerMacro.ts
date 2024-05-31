import { ContextType, NewableType, ServiceContainerInterface } from '@ilos/common/index.ts';
import test, { ExecutionContext, Macro } from 'ava';
import { KernelBeforeAfter, KernelTestFn, makeKernelBeforeAfter } from './helpers.ts';

interface HandlerConfigInterface {
  service: string;
  method: string;
}

type successCheck<R, C = any> = (params: R, t: ExecutionContext<C>) => Promise<void> | void;
type errorCheck<E = Error, C = any> = (params: E, t: ExecutionContext<C>) => Promise<void> | void;
type paramsBuilder<P, C = any> = (t: ExecutionContext<C>) => Promise<P> | P;

interface HandlerMacroInterface<P, R, E, C> extends KernelBeforeAfter {
  success: Macro<
    [
      P | paramsBuilder<P, HandlerMacroContext & C>,
      Partial<R> | successCheck<R, HandlerMacroContext & C>,
      Partial<ContextType>?,
    ],
    HandlerMacroContext
  >;
  error: Macro<
    [
      P | paramsBuilder<P, HandlerMacroContext & C>,
      string | errorCheck<E, HandlerMacroContext & C>,
      Partial<ContextType>?,
    ],
    HandlerMacroContext
  >;
}
export type HandlerMacroContext = KernelTestFn;

function title(providedTitle = '', params: any, response: any, currentContext) {
  if (typeof providedTitle === 'string' && providedTitle.length) return providedTitle;
  return `${params} = ${response}`.trim();
}

export function handlerMacro<ActionParams, ActionResult, ActionError extends Error = Error, TestContext = unknown>(
  serviceProviderCtor: NewableType<ServiceContainerInterface>,
  handlerConfig: HandlerConfigInterface,
): HandlerMacroInterface<ActionParams, ActionResult, ActionError, TestContext> {
  const { before, after } = makeKernelBeforeAfter(serviceProviderCtor);

  const emptyContext: ContextType = {
    call: {
      user: {},
    },
    channel: {
      service: '',
    },
  };

  const success: Macro<
    [
      ActionParams | paramsBuilder<ActionParams, HandlerMacroContext & TestContext>,
      Partial<ActionResult> | successCheck<ActionResult, HandlerMacroContext & TestContext>,
      Partial<ContextType>?,
    ],
    HandlerMacroContext
  > = test.macro({
    async exec(t: ExecutionContext<HandlerMacroContext & TestContext>, params, response, currentContext = {}) {
      try {
        const context = {
          ...emptyContext,
          ...currentContext,
        };
        const finalParams =
          typeof params === 'function'
            ? await (params as paramsBuilder<ActionParams, HandlerMacroContext & TestContext>)(t)
            : params;

        const kernel = t.context.kernel;
        const result = await kernel.call<ActionParams, ActionResult>(
          `${handlerConfig.service}:${handlerConfig.method}`,
          finalParams,
          context,
        );
        // t.log(`Calling ${handlerConfig.service}:${handlerConfig.method}`, { params: finalParams, context });
        if (typeof response === 'function') {
          await response(result, t);
        } else {
          if (typeof result === 'object' && result !== null && !Array.isArray(result)) {
            t.like(result, response as Awaited<ActionResult>);
          } else {
            t.deepEqual(result, response as Awaited<ActionResult>);
          }
        }
      } catch (e) {
        t.log(e.message);
        throw e;
      }
    },
    title,
  });

  const error: Macro<
    [
      ActionParams | paramsBuilder<ActionParams, HandlerMacroContext & TestContext>,
      string | errorCheck<ActionError, TestContext & KernelTestFn>,
      Partial<ContextType>?,
    ],
    HandlerMacroContext
  > = test.macro({
    async exec(t: ExecutionContext<HandlerMacroContext & TestContext>, params, message, currentContext = {}) {
      const context = {
        ...emptyContext,
        ...currentContext,
      };
      const finalParams =
        typeof params === 'function'
          ? await (params as paramsBuilder<ActionParams, TestContext & KernelTestFn>)(t)
          : params;

      const kernel = t.context.kernel;
      const err = await t.throwsAsync<ActionError>(
        async () =>
          await kernel.call<ActionParams>(`${handlerConfig.service}:${handlerConfig.method}`, finalParams, context),
      );
      t.log(err.message);
      if (typeof message === 'function') {
        await message(err as any, t);
      } else {
        t.is(err.message, message);
      }
    },
    title,
  });

  return {
    before,
    after,
    error,
    success,
  };
}
