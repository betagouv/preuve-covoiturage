import { assertEquals, assert, assertFalse, assertThrows, assertObjectMatch, afterEach, beforeEach, afterAll, beforeAll, describe, it } from '@/dev_deps.ts';
import { assertEquals, assert, assertFalse, assertThrows, assertObjectMatch, afterEach, beforeEach, afterAll, beforeAll, describe, it } from '@/dev_deps.ts';
import { ServiceProvider as AbstractServiceProvider } from '@/ilos/core/index.ts';
import { command, serviceProvider as serviceProviderDecorator, ResultType } from '@/ilos/common/index.ts';

import { CommandRegistry } from '../providers/CommandRegistry.ts';
import { CommandExtension } from './CommandExtension.ts';
import { Command } from '../parents/Command.ts';

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

it('Command "call": should register', async (t) => {
  const { serviceProvider } = setup();
  await serviceProvider.register();
  await serviceProvider.init();

  const basicCommand = serviceProvider.getContainer().get(CommandRegistry).commands[0];
  assertEquals(basicCommand.name(), 'hello');
  assertEquals(basicCommand.description(), 'toto');
});

it('Command "call": should work', async (t) => {
  const { serviceProvider, fake } = setup();
  const container = serviceProvider.getContainer();
  await serviceProvider.register();
  await serviceProvider.init();
  const commander = container.get<CommandRegistry>(CommandRegistry);
  commander.parse(['', '', 'hello', 'john']);
  assertObjectMatch(fake.getCalls().pop().args, ['john', {}]);
});
