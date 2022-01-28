import { NewableType, ServiceContainerInterface } from '@ilos/common';
import test, { ExecutionContext, Macro } from 'ava';
import { makeKernelBeforeAfter, KernelBeforeAfter, KernelTestFn } from '@pdc/helper-test';

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

interface SelfCheckMacroInterface extends KernelBeforeAfter {
  range: Macro<
    [Partial<SelfCheckParamsInterface>, number, number, boolean?],
    KernelTestFn
  >;
}

export type SelfCheckMacroContext = KernelTestFn;
export function selfCheckMacro<TestContext = unknown>(
  serviceProviderCtor: NewableType<ServiceContainerInterface>,
  checkCtor: NewableType<HandleCheckInterface<SelfCheckParamsInterface>>,
): SelfCheckMacroInterface {
  const { before, after } = makeKernelBeforeAfter(serviceProviderCtor);
  const range: Macro<
    [Partial<SelfCheckParamsInterface>, number, number, boolean?],
    KernelTestFn
  > = test.macro({
      exec: async (
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
      },
      title: (providedTitle = ''): string => `${providedTitle} range`.trim(),
  });

  return {
    range,
    before,
    after,
  };
}
