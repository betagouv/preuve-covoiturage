// tslint:disable max-classes-per-file
import test from 'ava';

import * as winston from 'winston';
import { injectable, serviceProvider, HasLogger, LoggerInterface, DefaultLogger } from '@ilos/common';
import { ServiceContainer } from '@ilos/core';

import { LoggerExtension } from './LoggerExtension';

test('Logger provider: should have default logger', (t) => {
  @injectable()
  class Test extends HasLogger {
    getLogger(): LoggerInterface {
      return this.logger;
    }
  }
  class Service extends ServiceContainer {}
  const serviceContainer = new Service();

  serviceContainer.bind(Test);
  const test = serviceContainer.get(Test);
  t.true(test.getLogger() instanceof DefaultLogger);
});

test('Logger provider: should replace logger', async (t) => {
  @injectable()
  class Test extends HasLogger {
    getLogger(): LoggerInterface {
      return this.logger;
    }
  }

  @serviceProvider({
    config: {},
  })
  class Service extends ServiceContainer {
    extensions = [LoggerExtension];
  }
  const serviceContainer = new Service();
  serviceContainer.bind(Test);
  await serviceContainer.register();
  await serviceContainer.init();

  const test = serviceContainer.get(Test);
  // TODO: check interface instead
  t.is(test.getLogger().constructor.name, winston.createLogger().constructor.name);
});
