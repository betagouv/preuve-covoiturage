import { kernel as kernelDecorator, KernelInterface } from '@ilos/common';
import { Kernel as AbstractKernel } from '@ilos/framework';
import { NormalisationProcessAction } from '../src/actions/NormalizationProcessAction';
import { ServiceProvider } from '../src/ServiceProvider';

@kernelDecorator({
  children: [ServiceProvider],
})
class Kernel extends AbstractKernel {}

describe('toto', () => {
  let kernel: KernelInterface;
  let action: NormalisationProcessAction;
  before(async () => {
    kernel = new Kernel();
    await kernel.bootstrap();
    action = kernel.get(ServiceProvider).get(NormalisationProcessAction);
  });

  after(async () => {
    await kernel.shutdown();
  });

  it('works', async () => {
    action.handle();
  });
});
