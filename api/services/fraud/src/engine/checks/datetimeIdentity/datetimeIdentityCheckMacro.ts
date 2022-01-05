import { NewableType, ServiceContainerInterface } from '@ilos/common';
import { Macro, TestFn, ExecutionContext } from 'ava';

import { makeKernel, KernelTestFn } from '@pdc/helper-test';

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
  anyTest: TestFn,
  serviceProviderCtor: NewableType<ServiceContainerInterface>,
  checkCtor: NewableType<HandleCheckInterface<DatetimeIdentityCheckParamsInterface>>,
): {
  test: TestFn<TestContext & KernelTestFn>;
  range: Macro<
    [Partial<SingleDatetimeIdentityCheckParamsInterface>[], number, number, boolean?],
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

  const range: Macro<
    [Partial<SingleDatetimeIdentityCheckParamsInterface>[], number, number, boolean?],
    TestContext & KernelTestFn
  > = async (
    t: ExecutionContext<TestContext & KernelTestFn>,
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
