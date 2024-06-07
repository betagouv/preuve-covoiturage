import { assertEquals, assert, assertFalse, assertThrows, assertObjectMatch, afterEach, beforeEach, afterAll, beforeAll, describe, it } from '@/dev_deps.ts';

import { ConfigStore } from './Config.ts';

it('Config provider: works with simple object', async (t) => {
  const config = new ConfigStore({
    helloWorld: { hello: 'world' },
  });
  assertObjectMatch(config.get('helloWorld'), { hello: 'world' });
});

it('Config provider: fails if not found without fallback', async (t) => {
  const config = new ConfigStore({
    helloWorld: { hello: 'world' },
  });
  t.throws(() => config.get('helloMissing'), { instanceOf: Error }, "Unknown config key 'helloMissing'");
});

it('Config provider: works if not found with fallback', async (t) => {
  const config = new ConfigStore({
    helloWorld: { hello: 'world' },
  });
  assertObjectMatch(config.get('helloMissing', { hello: 'fallback' }), { hello: 'fallback' });
});
