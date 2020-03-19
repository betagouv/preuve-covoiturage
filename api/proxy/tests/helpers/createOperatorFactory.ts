import { KernelInterface } from '@ilos/common';
import { OperatorInterface } from '../../src/shared/operator/common/interfaces/OperatorInterface';
import { OperatorDbInterface } from '../../src/shared/operator/common/interfaces/OperatorDbInterface';

export async function createOperatorFactory(
  kernel: KernelInterface,
  operator: OperatorInterface,
): Promise<OperatorDbInterface> {
  return kernel.call('operator:create', operator, {
    call: { user: { permissions: ['operator.create'] } },
    channel: {
      service: 'operator',
      transport: 'http',
    },
  });
}
