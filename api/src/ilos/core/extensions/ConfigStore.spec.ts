import test from 'ava';

import { ConfigStore } from './Config';

test('Config provider: works with simple object', async (t) => {
  const config = new ConfigStore({
    helloWorld: { hello: 'world' },
  });
  t.deepEqual(config.get('helloWorld'), { hello: 'world' });
});

test('Config provider: fails if not found without fallback', async (t) => {
  const config = new ConfigStore({
    helloWorld: { hello: 'world' },
  });
  t.throws(() => config.get('helloMissing'), { instanceOf: Error }, "Unknown config key 'helloMissing'");
});

test('Config provider: works if not found with fallback', async (t) => {
  const config = new ConfigStore({
    helloWorld: { hello: 'world' },
  });
  t.deepEqual(config.get('helloMissing', { hello: 'fallback' }), { hello: 'fallback' });
});
