import { assertEquals, assert, assertFalse, assertThrows, assertObjectMatch, afterEach, beforeEach, afterAll, beforeAll, describe, it } from '@/dev_deps.ts';
import { AjvValidator } from '@/ilos/validator/index.ts';
import { Extensions } from '@/ilos/core/index.ts';

import { macroKeyword } from './macroKeyword.ts';

it('should return schema if macro exist', (t) => {
  assert(Reflect.ownKeys((macroKeyword as any).macro('uuid')).length > 0);
});

it('should return empty schema if macro doest not exist', (t) => {
  assert(Reflect.ownKeys((macroKeyword as any).macro('aa')).length === 0);
});

interface Context {
  validator: AjvValidator;
}

beforeAll((t: ExecutionContext<Context>) => {
  const config = new Extensions.ConfigStore({});
  t.context.validator = new AjvValidator(config);
  t.context.validator.boot();
  t.context.validator.registerCustomKeyword({ type: 'keyword', definition: macroKeyword });
});

it('base64', async (t: ExecutionContext<Context>) => {
  const { validator: v } = t.context;
  v.registerValidator({ macro: 'base64' }, 'base64');

  assert(await v.validate('anNvbnNjaGVtYQ==', 'base64'));
  assert(await v.validate('', 'base64'));
  await assertThrows(() => v.validate('*', 'base64'));
});

it('dbid', async (t: ExecutionContext<Context>) => {
  const { validator: v } = t.context;
  v.registerValidator({ macro: 'dbid' }, 'dbid');

  assert(await v.validate('anNvbnNjaGVtYQ==', 'dbid'));
  assert(await v.validate('P;Zk7WZPi}$?X#*?U(M7EE_AJN_!?;/=JLkZ_5Aw%857dW+mmZM9/hh.Wz.RuG*%', 'dbid'));
  assert(await v.validate('fb765772-0b28-4acd-b1b7-20ad958df863', 'dbid'));
  assert(await v.validate(42, 'dbid'));
  assert(await v.validate(Number.MAX_SAFE_INTEGER, 'dbid'));
  await assertThrows(() => v.validate('', 'dbid'));
  await assertThrows(() => v.validate({}, 'dbid'));
  await assertThrows(() => v.validate('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'dbid'));
});

it('email', async (t: ExecutionContext<Context>) => {
  const { validator: v } = t.context;
  v.registerValidator({ macro: 'email' }, 'email');

  assert(await v.validate('jon.doe@example.com', 'email'));
  assert(await v.validate('jon.doe+somelabel@example.co.uk', 'email'));
  await assertThrows(() => v.validate('a@b', 'email'));
  await assertThrows(() => v.validate('*', 'email'));
});

it('permissions', async (t: ExecutionContext<Context>) => {
  const { validator: v } = t.context;
  v.registerValidator({ macro: 'permissions' }, 'permissions');

  assert(await v.validate(['common.user.list'], 'permissions'));
  assert(await v.validate(['userList.list'], 'permissions'));
  await assertThrows(() => v.validate(['userList.list', '<script>alert();</script>'], 'permissions'));
  await assertThrows(() => v.validate(['user:list'], 'permissions'));
  await assertThrows(() => v.validate([424242], 'permissions'));
});

it('serial', async (t: ExecutionContext<Context>) => {
  const { validator: v } = t.context;
  v.registerValidator({ macro: 'serial' }, 'serial');

  assert(await v.validate(42, 'serial'));

  // 2147483647 is max int4 value in PostgreSQL
  assert(await v.validate(2147483647, 'serial'));
  await assertThrows(() => v.validate(2147483647 + 1, 'serial'));
});

it('timestamp', async (t: ExecutionContext<Context>) => {
  const { validator: v } = t.context;
  v.registerValidator({ macro: 'timestamp' }, 'ts');

  assert(await v.validate('2020-01-01T00:00:00Z', 'ts'));
  assert(await v.validate('2020-01-01 00:00:00Z', 'ts'));
  assert(await v.validate('2020-01-01T00:00:00+0100', 'ts'));
  assert(await v.validate('2020-01-01T00:00:00-0530', 'ts'));
  await assertThrows(() => v.validate('2020-01-01', 'ts'));
  await assertThrows(() => v.validate('2020/01/01', 'ts'));
  await assertThrows(() => v.validate('01/01/2020', 'ts'));
});

it('uuid', async (t: ExecutionContext<Context>) => {
  const { validator: v } = t.context;
  v.registerValidator({ macro: 'uuid' }, 'uuid');

  assert(await v.validate('fb765772-0b28-4acd-b1b7-20ad958df863', 'uuid'));
  assert(await v.validate('FB765772-0B28-4ACD-B1B7-20AD958DF863', 'uuid'));
  await assertThrows(() => v.validate('abcd', 'uuid'));
});
