import { assertEquals, assert, assertFalse, assertThrows, assertObjectMatch, afterEach, beforeEach, afterAll, beforeAll, describe, it } from '@/dev_deps.ts';
import { ResultType, CommandOptionType } from '@/ilos/common/index.ts';

import { Command } from './Command.ts';

it('Command: works', async (t) => {
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
  assertEquals(r, 'Hello John!');
});
