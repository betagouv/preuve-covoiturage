// tslint:disable max-classes-per-file
import test from 'ava';
import sinon from 'sinon';

import { Kernel } from '@ilos/core';
import {
  command as commandDecorator,
  kernel as kernelDecorator,
  ResultType,
  NewableType,
  ExtensionInterface,
} from '@ilos/common';

import { CommandExtension } from '../extensions/CommandExtension';
import { Command } from '../parents/Command';
import { CommandRegistry } from '../providers/CommandRegistry';
import { CliTransport } from './CliTransport';

function setup() {
  @commandDecorator()
  class BasicCommand extends Command {
    static readonly signature: string = 'hello <name>';
    static readonly description: string = 'The hello world command';
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

  @kernelDecorator({
    commands: [BasicCommand],
  })
  class BasicKernel extends Kernel {
    readonly extensions: NewableType<ExtensionInterface>[] = [CommandExtension];
  }

  const kernel = new BasicKernel();
  return { kernel };
}

test('Cli transport: should work', async (t) => {
  t.plan(1);
  const { kernel } = setup();
  await kernel.bootstrap();
  const cliTransport = new CliTransport(kernel);
  const container = kernel.getContainer();
  const commander = container.get<CommandRegistry>(CommandRegistry);
  sinon.stub(commander, 'output').callsFake((...args: any[]) => {
    t.is(args[0], 'Hello john');
  });
  container.unbind(CommandRegistry);
  container.bind(CommandRegistry).toConstantValue(commander);
  return cliTransport.up(['', '', 'hello', 'john']);
});
