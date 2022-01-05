import { ServiceContainerInterface, NewableType } from '@ilos/common';
import { Macro, TestFn, ExecutionContext } from 'ava';

import { makeKernel, KernelTestFn } from './helpers';

export function serviceProviderMacro<TestContext = unknown>(
  anyTest: TestFn,
  serviceProviderCtor: NewableType<ServiceContainerInterface>,
): {
  test: TestFn<TestContext & KernelTestFn>;
  boot: Macro<[], TestContext & KernelTestFn>;
} {
  const test = anyTest as TestFn<TestContext & KernelTestFn>;

  test.before(async (t) => {
    t.context.kernel = makeKernel(serviceProviderCtor);
  });

  test.after.always(async (t) => {
    await t.context.kernel.shutdown();
  });

  const boot: Macro<[], TestContext & KernelTestFn> = async (
    t: ExecutionContext<TestContext & KernelTestFn>,
  ) => {
    await t.notThrowsAsync(async () => t.context.kernel.bootstrap());
  };
  boot.title = (providedTitle = ''): string => `${providedTitle} boot`.trim();

  return {
    boot,
    test,
  };
}
