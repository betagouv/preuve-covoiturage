import test from 'ava';
import sinon from 'sinon';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { command, serviceProvider as serviceProviderDecorator, ResultType } from '@ilos/common';

import { CommandRegistry } from '../providers/CommandRegistry';
import { CommandExtension } from './CommandExtension';
import { Command } from '../parents/Command';

function setup() {
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
      if (options && 'hi' in options) {
        return `Hi ${name}`;
      }
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

  return { serviceProvider };
}

test('Command "call": should register', async (t) => {
  const { serviceProvider } = setup();
  await serviceProvider.register();
  await serviceProvider.init();

  const basicCommand = serviceProvider.getContainer().get(CommandRegistry).commands[0];
  t.is(basicCommand.name(), 'hello');
  t.is(basicCommand.options.length, 1);

  const { description, flags, required, short } = basicCommand.options[0];
  t.is(description, 'Say hi');
  t.is(flags, '-h, --hi');
  t.is(required, false);
  t.is(short, '-h');
});

test('Command "call": should work', async (t) => {
  t.plan(1);
  const { serviceProvider } = setup();
  const container = serviceProvider.getContainer();
  await serviceProvider.register();
  await serviceProvider.init();
  const commander = container.get<CommandRegistry>(CommandRegistry);
  sinon.stub(commander, 'output').callsFake((...args: any[]) => {
    t.is(args[0], 'Hello john');
  });
  container.unbind(CommandRegistry);
  container.bind(CommandRegistry).toConstantValue(commander);
  commander.parse(['', '', 'hello', 'john']);
});
