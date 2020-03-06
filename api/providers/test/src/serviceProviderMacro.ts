import { ServiceContainerInterface, NewableType } from '@ilos/common';
import { Macro, TestInterface, ExecutionContext } from 'ava';

import { makeKernel, KernelTestInterface } from './helpers';

export function serviceProviderMacro<TestContext = unknown>(
  anyTest: TestInterface,
  serviceProviderCtor: NewableType<ServiceContainerInterface>,
): {
  test: TestInterface<TestContext & KernelTestInterface>;
  boot: Macro<[], TestContext & KernelTestInterface>;
} {
  const test = anyTest as TestInterface<TestContext & KernelTestInterface>;

  test.before(async (t) => {
    t.context.kernel = makeKernel(serviceProviderCtor);
  });

  test.after.always(async (t) => {
    await t.context.kernel.shutdown();
  });

  const boot: Macro<[], TestContext & KernelTestInterface> = async (
    t: ExecutionContext<TestContext & KernelTestInterface>,
  ) => {
    await t.notThrowsAsync(async () => t.context.kernel.bootstrap());
  };
  boot.title = (providedTitle = ''): string => `${providedTitle} boot`.trim();

  return {
    boot,
    test,
  };
}
