import { NewableType, ServiceContainerInterface } from '@ilos/common';
import anyTest, { ExecutionContext, Macro, TestFn } from 'ava';
import { makeKernelBeforeAfter, KernelBeforeAfter, KernelTestFn } from '@pdc/helper-test';

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
interface TripIdentityMacroInterface extends KernelBeforeAfter {
  test: TestFn<KernelTestFn>;
  range: Macro<[Partial<SingleTripIdentityCheckParamsInterface>[], number, number, boolean?], KernelTestFn>;
}

export type SelfCheckMacroContext = KernelTestFn;
export function tripIdentityCheckMacro<TestContext = unknown>(
  serviceProviderCtor: NewableType<ServiceContainerInterface>,
  checkCtor: NewableType<HandleCheckInterface<TripIdentityCheckParamsInterface>>,
): TripIdentityMacroInterface {
  const { before, after } = makeKernelBeforeAfter(serviceProviderCtor);
  const range: Macro<[Partial<SingleTripIdentityCheckParamsInterface>[], number, number, boolean?], KernelTestFn> =
    anyTest.macro({
      exec: async (
        t: ExecutionContext<TestContext & KernelTestFn>,
        input: Partial<SingleTripIdentityCheckParamsInterface>[],
        min: number,
        max: number,
      ) => {
        const check = t.context.kernel
          .get<ServiceContainerInterface>(serviceProviderCtor)
          .get<HandleCheckInterface<TripIdentityCheckParamsInterface>>(checkCtor);
        const data = input.map((i) => faker(i));
        const box = { result: undefined };
        await check.handle(data, (nb: number) => (box.result = nb));
        t.log(data);
        t.log(box.result);
        t.true(box.result >= min);
        t.true(box.result <= max);
      },

      title: (providedTitle = ''): string => `${providedTitle} range`.trim(),
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
    range,
    after,
    before,
    test,
  };
}
