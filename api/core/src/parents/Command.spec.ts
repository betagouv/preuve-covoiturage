// tslint:disable no-invalid-this
import { describe } from 'mocha';
import { expect } from 'chai';

import { Command } from './Command';
import { ResultType } from '../types/ResultType';
import { CommandOptionType } from '../types/CommandOptionType';
import { CommandProvider } from '../providers/CommandProvider';

const kernel = {
  commander: null,
  providers: [],
  services: [],
  boot() { return; },
  async handle(call) {
    return call;
  },
  get() {
    if (!this.commander) {
      this.commander = new CommandProvider(this);
    }
    return this.commander;
  },
};

describe('Queue provider', () => {
  it('works', async (done) => {
    class BasicCommand extends Command {
      public readonly signature: string = 'hello <name>';
      public readonly description: string = 'basic hello command';
      public readonly options: CommandOptionType[] = [
        { signature: '-h, --hi', description: 'hi' },
      ];
      public async call(name, opts):Promise<ResultType> {
        if (name === 'crash') {
          throw new Error();
        }
        this.command.emit('done', (opts && 'hi' in opts) ? `Hi ${name}!` : `Hello ${name}!`);
        return;
      }
    }
    const command = new BasicCommand(kernel);
    command.boot();
    expect(command.command.name()).to.equal('hello');
    expect(command.command.options).to.have.length(1);
    expect(command.command.options[0]).to.deep.include({
      flags: '-h, --hi',
      required: false,
      optional: false,
      bool: true,
      short: '-h',
      long: '--hi',
      description: 'hi',
    });

    command.command.on('done', (data) => {
      expect(data).to.equal('Hello john!');
      done();
    });

    command.commander.parse(['', '', 'hello', 'john']);
  });
});

