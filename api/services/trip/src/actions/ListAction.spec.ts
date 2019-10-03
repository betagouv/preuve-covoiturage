import { describe } from 'mocha';

import { Kernel as AbstractKernel } from '@ilos/framework';
import { kernel as kernelDecorator } from '@ilos/common';

import { ServiceProvider } from '../ServiceProvider';

@kernelDecorator({
  children: [ServiceProvider],
})
class Kernel extends AbstractKernel {}

let kernel;

describe('List action', () => {
  before(async () => {
    kernel = new Kernel();
    await kernel.bootstrap();
  });

  after(async () => {
    await kernel.shutdown();
  });

  it('should work', async () => {
    const r = await kernel.call(
      'trip:list',
      {
        campaign_id: ['campaign'],
        date: {
          start: new Date(),
          end: new Date(),
        },
        hour: {
          start: 0,
          end: 8,
        },
        days: [1, 2, 3],
        distance: {
          min: 10,
          max: 1000,
        },
        ranks: ['a'],
        operator_id: ['operator'],
        territory_id: ['territory'],
        skip: 1,
        limit: 2,
      },
      {
        call: {
          user: {
            permissions: ['trip.list'],
          },
        },
      },
    );

    console.log(JSON.stringify(r));
  });
});
