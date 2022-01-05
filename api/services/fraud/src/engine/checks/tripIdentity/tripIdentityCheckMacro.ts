import { NewableType, ServiceContainerInterface } from '@ilos/common';
import { Macro, TestFn, ExecutionContext } from 'ava';

import { makeKernel, KernelTestFn } from '@pdc/helper-test';

import {
  SingleTripIdentityCheckParamsInterface,
  TripIdentityCheckParamsInterface,
} from './TripIdentityCheckParamsInterface';
import { HandleCheckInterface } from '../../../interfaces';

export function faker(data: Partial<SingleTripIdentityCheckParamsInterface>): SingleTripIdentityCheckParamsInterface {
  const defaultData = {
    phone: '',
    phone_trunc: '',
    operator_id: '',
    operator_user_id: '',
    firstname: '',
    lastname: '',
    email: '',
    travel_pass_name: '',
    travel_pass_user_id: '',
  };

  return { ...defaultData, ...data };
}

export function tripIdentityCheckMacro<TestContext = unknown>(
  anyTest: TestFn,
  serviceProviderCtor: NewableType<ServiceContainerInterface>,
  checkCtor: NewableType<HandleCheckInterface<TripIdentityCheckParamsInterface>>,
): {
  test: TestFn<TestContext & KernelTestFn>;
  range: Macro<
    [Partial<SingleTripIdentityCheckParamsInterface>[], number, number, boolean?],
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
    [Partial<SingleTripIdentityCheckParamsInterface>[], number, number, boolean?],
    TestContext & KernelTestFn
  > = async (
    t: ExecutionContext<TestContext & KernelTestFn>,
    input: Partial<SingleTripIdentityCheckParamsInterface>[],
    min: number,
    max: number,
  ) => {
    const check = t.context.kernel
      .get<ServiceContainerInterface>(serviceProviderCtor)
      .get<HandleCheckInterface<TripIdentityCheckParamsInterface>>(checkCtor);
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
