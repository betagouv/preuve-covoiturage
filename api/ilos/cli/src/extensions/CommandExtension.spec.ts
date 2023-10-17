import test from 'ava';
import sinon from 'sinon';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { command, serviceProvider as serviceProviderDecorator, ResultType } from '@ilos/common';

import { CommandRegistry } from '../providers/CommandRegistry';
import { CommandExtension } from './CommandExtension';
import { Command } from '../parents/Command';

function setup() {
  const fake = sinon.fake();
  @command()
  class BasicCommand extends Command {
    static readonly signature: string = 'hello <name>';
    static readonly description: string = 'toto';
    static readonly options = [
      {
        signature: '-h, --hi',
        description: 'Say hi',
      },
    ];

    public async call(name, options?): Promise<ResultType> {
      fake(name, options);
      return `Hello ${name}`;
    }
  }

  @serviceProviderDecorator({
    commands: [BasicCommand],
  })
  class ServiceProvider extends AbstractServiceProvider {
    extensions = [CommandExtension];
  }

  const serviceProvider = new ServiceProvider();

  return { serviceProvider, fake };
}

test('Command "call": should register', async (t) => {
  const { serviceProvider } = setup();
  await serviceProvider.register();
  await serviceProvider.init();

  const basicCommand = serviceProvider.getContainer().get(CommandRegistry).commands[0];
  t.is(basicCommand.name(), 'hello');
  t.is(basicCommand.description(), 'toto');
});

test('Command "call": should work', async (t) => {
  const { serviceProvider, fake } = setup();
  const container = serviceProvider.getContainer();
  await serviceProvider.register();
  await serviceProvider.init();
  const commander = container.get<CommandRegistry>(CommandRegistry);
  commander.parse(['', '', 'hello', 'john']);
  t.deepEqual(fake.getCalls().pop().args, ['john', {}]);
});
