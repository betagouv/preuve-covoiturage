import test from 'ava';
import { ResultType, CommandOptionType } from '@ilos/common';

import { Command } from './Command';

test('Command: works', async (t) => {
  class BasicCommand extends Command {
    static readonly signature: string = 'hello <name>';
    static readonly description: string = 'basic hello command';
    static readonly options: CommandOptionType[] = [{ signature: '-h, --hi', description: 'hi' }];
    public async call(name, opts): Promise<ResultType> {
      if (name === 'crash') {
        throw new Error();
      }
      return opts && 'hi' in opts ? `Hi ${name}!` : `Hello ${name}!`;
    }
  }
  const cmd = new BasicCommand();
  const r = await cmd.call('John', {});
  t.is(r, 'Hello John!');
});
