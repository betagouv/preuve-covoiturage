import { NewableType } from '@ilos/common';
import { KernelBeforeAfter, KernelTestFn } from '@pdc/helper-test';
import anyTest, { ExecutionContext, Macro, TestFn } from 'ava';

import { HandleCheckInterface } from '../../../interfaces';
import {
  SingleTripIdentityCheckParamsInterface,
  TripIdentityCheckParamsInterface,
} from './TripIdentityCheckParamsInterface';

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
  checkCtor: NewableType<HandleCheckInterface<TripIdentityCheckParamsInterface>>,
): TripIdentityMacroInterface {
  const range: Macro<[Partial<SingleTripIdentityCheckParamsInterface>[], number, number, boolean?], KernelTestFn> =
    anyTest.macro({
      exec: async (
        t: ExecutionContext<TestContext & KernelTestFn>,
        input: Partial<SingleTripIdentityCheckParamsInterface>[],
        min: number,
        max: number,
      ) => {
        const check = new checkCtor();
        const data = input.map((i) => faker(i));
        const box = { result: undefined };
        await check.handle(data, (nb: number) => (box.result = nb));
        t.true(box.result >= min);
        t.true(box.result <= max);
      },

      title: (providedTitle = ''): string => `${providedTitle} range`.trim(),
    });

  const test = anyTest as TestFn<KernelTestFn>;

  return {
    range,
    after: null,
    before: null,
    test,
  };
}
