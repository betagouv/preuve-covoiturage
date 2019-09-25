import { expect } from 'chai';
import path from 'path';
// import { describe } from 'mocha';
import { KernelInterfaceResolver, ConfigInterfaceResolver } from '@ilos/common';

import { TripPgRepositoryProviderInterfaceResolver } from '../interfaces';
import { CrosscheckAction } from './CrosscheckAction';

const repository = new (class extends TripPgRepositoryProviderInterfaceResolver {
  async findOrCreateTripForJourney(journey: any): Promise<[boolean, { _id: string }]> {
    return [true, { _id: 'test' }];
  }
})();

const config = new (class extends ConfigInterfaceResolver {
  delay = 7 * 24 * 60 * 60 * 1000;
  get(k: string): any {
    return this.delay;
  }
})();

describe('Crosscheck action', () => {
  it('should dispatch with default delay', (done) => {
    const kernel = new (class extends KernelInterfaceResolver {
      async notify(method: string, params: any, context: any): Promise<void> {
        expect(context.channel.metadata).to.have.property('delay');
        expect(context.channel.metadata.delay).to.eq(config.delay);
        done();
        return;
      }
    })();
    const action = new CrosscheckAction(kernel, config, repository);
    action.call({
      method: '',
      params: {},
      context: {
        call: {
          user: {},
        },
        channel: {
          service: '',
        },
      },
    });
  });

  it('should dispatch with calculated delay', (done) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const currentDelay = Math.round((config.delay - (new Date().valueOf() - yesterday.valueOf())) / 1000);

    const kernel = new (class extends KernelInterfaceResolver {
      async notify(method: string, params: any, context: any): Promise<void> {
        expect(context.channel.metadata).to.have.property('delay');
        expect(Math.round(context.channel.metadata.delay / 1000)).to.eq(currentDelay);
        done();
        return;
      }
    })();

    const action = new CrosscheckAction(kernel, config, repository);
    action.call({
      method: '',
      params: {
        driver: {
          start: {
            datetime: yesterday,
          },
        },
      },
      context: {
        call: {
          user: {},
        },
        channel: {
          service: '',
        },
      },
    });
  });
  it('should not dispatch if already created', (done) => {
    const customRepository = new (class extends TripPgRepositoryProviderInterfaceResolver {
      async findOrCreateTripForJourney(journey: any): Promise<[boolean, { _id: string }]> {
        return [false, { _id: 'test' }];
      }
    })();

    const kernel = new (class extends KernelInterfaceResolver {})();

    const action = new CrosscheckAction(kernel, config, customRepository);
    action
      .call({
        method: '',
        params: {},
        context: {
          call: {
            user: {},
          },
          channel: {
            service: '',
          },
        },
      })
      .then(() => {
        done();
      })
      .catch(() => {
        done('Dispatch should not be called here');
      });
  });
});
