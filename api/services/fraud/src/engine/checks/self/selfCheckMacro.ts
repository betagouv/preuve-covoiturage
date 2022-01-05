import { NewableType, ServiceContainerInterface } from '@ilos/common';
import { Macro, TestFn, ExecutionContext } from 'ava';

import { makeKernel, KernelTestFn } from '@pdc/helper-test';

import { SelfCheckParamsInterface } from './SelfCheckParamsInterface';
import { HandleCheckInterface } from '../../../interfaces';

export function faker(data: Partial<SelfCheckParamsInterface> = {}, deltaMode = false): SelfCheckParamsInterface {
  const defaultData = {
    driver_start_lat: 48.851047,
    driver_start_lon: 2.309339,
    driver_end_lat: 48.847218,
    driver_end_lon: 2.340339,
    driver_distance: 100,
    driver_calc_distance: 100,
    driver_duration: 300,
    driver_calc_duration: 300,
    passenger_start_lat: 48.851047,
    passenger_start_lon: 2.309339,
    passenger_end_lat: 48.847218,
    passenger_end_lon: 2.340339,
    passenger_distance: 100,
    passenger_calc_distance: 100,
    passenger_duration: 300,
    passenger_calc_duration: 300,
    passenger_seats: 1,
  };
  if (!deltaMode) {
    return {
      ...defaultData,
      ...data,
    };
  }
  for (const key of Reflect.ownKeys(data)) {
    defaultData[key] += data[key];
  }

  return defaultData;
}

export function selfCheckMacro<TestContext = unknown>(
  anyTest: TestFn,
  serviceProviderCtor: NewableType<ServiceContainerInterface>,
  checkCtor: NewableType<HandleCheckInterface<SelfCheckParamsInterface>>,
): {
  test: TestFn<TestContext & KernelTestFn>;
  range: Macro<[Partial<SelfCheckParamsInterface>, number, number, boolean?], TestContext & KernelTestFn>;
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
    [Partial<SelfCheckParamsInterface>, number, number, boolean?],
    TestContext & KernelTestFn
  > = async (
    t: ExecutionContext<TestContext & KernelTestFn>,
    input: Partial<SelfCheckParamsInterface>,
    min: number,
    max: number,
    deltaMode?: boolean,
  ) => {
    const check = t.context.kernel
      .get<ServiceContainerInterface>(serviceProviderCtor)
      .get<HandleCheckInterface<SelfCheckParamsInterface>>(checkCtor);
    const data = faker(input, deltaMode);
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
