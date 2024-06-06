import { ServiceContainerInterface, NewableType } from '/ilos/common/index.ts';
import anyTest, { Macro, TestFn } from 'ava';

import { KernelTestFn, KernelBeforeAfter, makeKernelBeforeAfter } from './helpers.ts';

export type ServiceProviderMacroContext = KernelTestFn;

interface ServiceProviderMacroInterface<C = unknown> extends KernelBeforeAfter {
  boot: Macro<[], ServiceProviderMacroContext & C>;
  test: TestFn<KernelTestFn>;
}

export function serviceProviderMacro<C = unknown>(
  serviceProviderCtor: NewableType<ServiceContainerInterface>,
): ServiceProviderMacroInterface<C> {
  const { before, after } = makeKernelBeforeAfter(serviceProviderCtor);

  const boot = anyTest.macro({
    exec(t) {
      t.pass();
    },
    title(providedTitle = '') {
      return `${providedTitle} boot`.trim();
    },
  });

  const test = anyTest as TestFn<KernelTestFn>;

  test.before(async (t) => {
    const { kernel } = await before();
    t.context.kernel = kernel;
  });

  test.after.always(async (t) => {
    await after({ kernel: t.context.kernel });
  });

  return {
    boot,
    before,
    after,
    test,
  };
}
