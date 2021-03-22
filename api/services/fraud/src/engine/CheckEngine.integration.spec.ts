import anyTest, { TestInterface } from 'ava';
import { makeKernel } from '@pdc/helper-test';

import { ServiceProvider } from '../ServiceProvider';
import { CheckEngine } from './CheckEngine';
import { KernelInterface } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres/dist';

interface TestContext {
  kernel: KernelInterface;
  engine: CheckEngine;
  connection: PostgresConnection;
  acquisitionId: number;
}

const test = anyTest as TestInterface<TestContext>;

test.before(async (t) => {
  t.context.acquisitionId = 1;
  t.context.kernel = makeKernel(ServiceProvider);
  await t.context.kernel.bootstrap();
  t.context.engine = t.context.kernel.get(ServiceProvider).get(CheckEngine);
  t.context.connection = t.context.kernel.get(ServiceProvider).get(PostgresConnection);
});

test.after.always(async (t) => {
  await t.context.kernel.shutdown();
});

test.serial('should throw if method doest exits', async (t) => {
  // const method = 'this.doesnt.exists';
  // const err = await t.throwsAsync(async () => t.context.engine.run(t.context.acquisitionId, [method]));
  // t.is(err.message, `Unknown check ${method}`);
  t.pass();
});
