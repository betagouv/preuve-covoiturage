import { NewableType, ServiceContainerInterface } from '@ilos/common';
import { Macro, TestInterface, ExecutionContext } from 'ava';

import { makeKernel, KernelTestInterface } from '@pdc/helper-test';

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
  }
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
  anyTest: TestInterface,
  serviceProviderCtor: NewableType<ServiceContainerInterface>,
  checkCtor: NewableType<HandleCheckInterface<SelfCheckParamsInterface>>,
): {
  test: TestInterface<TestContext & KernelTestInterface>;
  range: Macro<[Partial<SelfCheckParamsInterface>, number, number, boolean?], TestContext & KernelTestInterface>;
} {
  const test = anyTest as TestInterface<TestContext & KernelTestInterface>;

  test.before(async (t) => {
    t.context.kernel = makeKernel(serviceProviderCtor);
    await t.context.kernel.bootstrap();
  });

  test.after.always(async (t) => {
    await t.context.kernel.shutdown();
  });

  const range: Macro<[Partial<SelfCheckParamsInterface>, number, number, boolean?], TestContext & KernelTestInterface> = async (
    t: ExecutionContext<TestContext & KernelTestInterface>,
    input: Partial<SelfCheckParamsInterface>,
    min: number,
    max: number,
    deltaMode?: boolean,
  ) => {
    const check = t.context.kernel.get<ServiceContainerInterface>(serviceProviderCtor).get<HandleCheckInterface<SelfCheckParamsInterface>>(checkCtor);
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
