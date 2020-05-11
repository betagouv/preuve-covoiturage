import { NewableType, ServiceContainerInterface } from '@ilos/common';
import { Macro, TestInterface, ExecutionContext } from 'ava';

import { makeKernel, KernelTestInterface } from '@pdc/helper-test';

import {
  SingleDatetimeIdentityCheckParamsInterface,
  DatetimeIdentityCheckParamsInterface,
} from './DatetimeIdentityCheckParamsInterface';
import { HandleCheckInterface } from '../../../interfaces';

export function faker(
  data: Partial<SingleDatetimeIdentityCheckParamsInterface>,
): SingleDatetimeIdentityCheckParamsInterface {
  const defaultData: SingleDatetimeIdentityCheckParamsInterface = {
    inside: false,
    interval: 0,
  };

  return { ...defaultData, ...data };
}

export function datetimeIdentityCheckMacro<TestContext = unknown>(
  anyTest: TestInterface,
  serviceProviderCtor: NewableType<ServiceContainerInterface>,
  checkCtor: NewableType<HandleCheckInterface<DatetimeIdentityCheckParamsInterface>>,
): {
  test: TestInterface<TestContext & KernelTestInterface>;
  range: Macro<
    [Partial<SingleDatetimeIdentityCheckParamsInterface>[], number, number, boolean?],
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

  const range: Macro<
    [Partial<SingleDatetimeIdentityCheckParamsInterface>[], number, number, boolean?],
    TestContext & KernelTestInterface
  > = async (
    t: ExecutionContext<TestContext & KernelTestInterface>,
    input: Partial<SingleDatetimeIdentityCheckParamsInterface>[],
    min: number,
    max: number,
  ) => {
    const check = t.context.kernel
      .get<ServiceContainerInterface>(serviceProviderCtor)
      .get<HandleCheckInterface<DatetimeIdentityCheckParamsInterface>>(checkCtor);
    const data = input.map((i) => faker(i));
    const result = await check.handle(data);
    t.log(data);
    t.log(result);
    t.true(result >= min);
    t.true(result <= max);
  };

  range.title = (providedTitle = ''): string => `${providedTitle} range`.trim();

  return {
    range,
    test,
  };
}
