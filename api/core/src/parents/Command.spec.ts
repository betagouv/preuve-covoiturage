// tslint:disable no-invalid-this
import { describe } from 'mocha';
import { expect } from 'chai';

import { Command } from './Command';
import { ResultType } from '../types/ResultType';
import { CommandOptionType } from '../types/CommandOptionType';

describe('Command', () => {
  it('works', async () => {
    class BasicCommand extends Command {
      public readonly signature: string = 'hello <name>';
      public readonly description: string = 'basic hello command';
      public readonly options: CommandOptionType[] = [{ signature: '-h, --hi', description: 'hi' }];
      public async call(name, opts): Promise<ResultType> {
        if (name === 'crash') {
          throw new Error();
        }
        return opts && 'hi' in opts ? `Hi ${name}!` : `Hello ${name}!`;
      }
    }
    const cmd = new BasicCommand();
    const r = await cmd.call('John', {});
    expect(r).to.eq('Hello John!');
  });
});
