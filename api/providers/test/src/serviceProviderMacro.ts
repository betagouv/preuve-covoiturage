import { ServiceContainerInterface, NewableType } from '@ilos/common';
import test, { Macro } from 'ava';

import { KernelTestFn, KernelBeforeAfter, makeKernelBeforeAfter } from './helpers';

export type ServiceProviderMacroContext = KernelTestFn;

interface ServiceProviderMacroInterface<C = unknown> extends KernelBeforeAfter {
  boot: Macro<[], ServiceProviderMacroContext & C>;
}

export function serviceProviderMacro<C = unknown>(
  serviceProviderCtor: NewableType<ServiceContainerInterface>,
): ServiceProviderMacroInterface<C> {
  const { before, after } = makeKernelBeforeAfter(serviceProviderCtor);

  const boot = test.macro({
    exec(t) {
      t.pass();
    },
    title(providedTitle = '') {
      return `${providedTitle} boot`.trim();
    },
  });

  return {
    boot,
    before,
    after,
  };
}