import { KernelInterfaceResolver, ContextType } from '@ilos/common';

export class FakeKernelInterfaceResolver extends KernelInterfaceResolver {
  call(method: string, params: any, context: ContextType) {
    return null;
  }
}
