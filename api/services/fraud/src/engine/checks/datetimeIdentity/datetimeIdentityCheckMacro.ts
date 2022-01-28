import { NewableType, ServiceContainerInterface } from '@ilos/common';
import test, { ExecutionContext, Macro } from 'ava';
import { makeKernelBeforeAfter, KernelBeforeAfter, KernelTestFn } from '@pdc/helper-test';

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
interface DatetimeIdentityMacroInterface extends KernelBeforeAfter {
  range: Macro<
    [Partial<SingleDatetimeIdentityCheckParamsInterface>[], number, number, boolean?],
    KernelTestFn
  >;
}

export function datetimeIdentityCheckMacro(
  serviceProviderCtor: NewableType<ServiceContainerInterface>,
  checkCtor: NewableType<HandleCheckInterface<DatetimeIdentityCheckParamsInterface>>,
): DatetimeIdentityMacroInterface {
  const { before, after } = makeKernelBeforeAfter(serviceProviderCtor);
  const range: Macro<
    [Partial<SingleDatetimeIdentityCheckParamsInterface>[], number, number, boolean?],
    KernelTestFn
  > = test.macro({
      exec: async (
        t: ExecutionContext<KernelTestFn>,
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
      },
      title(providedTitle = ''): string { return `${providedTitle} range`.trim(); },
  });

  return {
    range,
    before,
    after,
  };
}
