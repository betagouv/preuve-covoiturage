// tslint:disable max-classes-per-file
import { describe } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { Kernel } from '../parents/Kernel';
import { CommandServiceProvider } from '../parents/CommandServiceProvider';
import { Command } from '../parents/Command';
import { ResultType } from '../types/ResultType';
import { CommandProvider } from '../providers/CommandProvider';
import { command } from '../Container';

import { CliTransport } from './CliTransport';

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
class BasicServiceCommandProvider extends CommandServiceProvider {
  public readonly commands = [BasicCommand];
}

class BasicKernel extends Kernel {
  alias = [
    CommandProvider,
  ];
  serviceProviders = [BasicServiceCommandProvider];
}

describe('Cli transport', () => {
  it('should work', (done) => {
    const kernel = new BasicKernel();
    kernel.boot().then(() => {
      const cliTransport = new CliTransport(kernel);
      const container = kernel.getContainer();
      const commander = container.get<CommandProvider>(CommandProvider);
      sinon.stub(commander, 'output').callsFake((...args: any[]) => {
        expect(args[0]).to.equal('Hello john');
        done();
      });
      container.unbind(CommandProvider);
      container.bind(CommandProvider).toConstantValue(commander);
      cliTransport.up(['', '', 'hello', 'john']);
      sinon.restore();
    });
  });
});
