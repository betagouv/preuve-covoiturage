// tslint:disable no-shadowed-variable max-classes-per-file no-invalid-this
import { describe } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { ResultType } from '../types/ResultType';
import { command } from '../container';
import { CommandProvider } from '../providers/CommandProvider';

import { CommandServiceProvider } from './CommandServiceProvider';
import { Command } from './Command';

@command()
class BasicCommand extends Command {
  public readonly signature: string = 'hello <name>';
  public readonly options = [
    {
      signature: '-h, --hi',
      description: 'Say hi',
    },
  ];

  public async call(name, options?):Promise<ResultType> {
    if (options && 'hi' in options) {
      return `Hi ${name}`;
    }
    return `Hello ${name}`;
  }
}

class FakeCommandServiceProvider extends CommandServiceProvider {
  public readonly commands = [BasicCommand];
}

describe('Command service provider', () => {
  it('should register properly', async () => {
    const commandProvider = new FakeCommandServiceProvider();
    await commandProvider.boot();
    const commandHandler = new commandProvider.commands[0]();
    const command = commandProvider.registerCommand(commandHandler);

    // await commandProvider.boot();
    expect(command.name()).to.equal('hello');
    expect(command.options).to.have.length(1);
    expect(command.options[0]).to.deep.include({
      flags: '-h, --hi',
      required: false,
      optional: false,
      bool: true,
      short: '-h',
      long: '--hi',
      description: 'Say hi',
    });
  });
  it('should work', (done) => {
    const commandProvider = new FakeCommandServiceProvider();
    commandProvider.boot().then(() => {
      const container = commandProvider.getContainer();
      const commander = container.get<CommandProvider>(CommandProvider);
      sinon.stub(commander, 'output').callsFake((...args: any[]) => {
        expect(args[0]).to.equal('Hello john');
        done();
      });
      container.unbind(CommandProvider);
      container.bind(CommandProvider).toConstantValue(commander);
      commander.parse(['', '', 'hello', 'john']);
      sinon.restore();
    });
  });
});
