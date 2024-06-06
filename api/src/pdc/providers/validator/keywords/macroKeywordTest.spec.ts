import test, { ExecutionContext } from '@/dev_deps.ts';
import { AjvValidator } from '@/ilos/validator/index.ts';
import { Extensions } from '@/ilos/core/index.ts';

import { macroKeyword } from './macroKeyword.ts';

test('should return schema if macro exist', (t) => {
  t.true(Reflect.ownKeys((macroKeyword as any).macro('uuid')).length > 0);
});

test('should return empty schema if macro doest not exist', (t) => {
  t.true(Reflect.ownKeys((macroKeyword as any).macro('aa')).length === 0);
});

interface Context {
  validator: AjvValidator;
}

test.before((t: ExecutionContext<Context>) => {
  const config = new Extensions.ConfigStore({});
  t.context.validator = new AjvValidator(config);
  t.context.validator.boot();
  t.context.validator.registerCustomKeyword({ type: 'keyword', definition: macroKeyword });
});

test('base64', async (t: ExecutionContext<Context>) => {
  const { validator: v } = t.context;
  v.registerValidator({ macro: 'base64' }, 'base64');

  t.true(await v.validate('anNvbnNjaGVtYQ==', 'base64'));
  t.true(await v.validate('', 'base64'));
  await t.throwsAsync(() => v.validate('*', 'base64'));
});

test('dbid', async (t: ExecutionContext<Context>) => {
  const { validator: v } = t.context;
  v.registerValidator({ macro: 'dbid' }, 'dbid');

  t.true(await v.validate('anNvbnNjaGVtYQ==', 'dbid'));
  t.true(await v.validate('P;Zk7WZPi}$?X#*?U(M7EE_AJN_!?;/=JLkZ_5Aw%857dW+mmZM9/hh.Wz.RuG*%', 'dbid'));
  t.true(await v.validate('fb765772-0b28-4acd-b1b7-20ad958df863', 'dbid'));
  t.true(await v.validate(42, 'dbid'));
  t.true(await v.validate(Number.MAX_SAFE_INTEGER, 'dbid'));
  await t.throwsAsync(() => v.validate('', 'dbid'));
  await t.throwsAsync(() => v.validate({}, 'dbid'));
  await t.throwsAsync(() => v.validate('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'dbid'));
});

test('email', async (t: ExecutionContext<Context>) => {
  const { validator: v } = t.context;
  v.registerValidator({ macro: 'email' }, 'email');

  t.true(await v.validate('jon.doe@example.com', 'email'));
  t.true(await v.validate('jon.doe+somelabel@example.co.uk', 'email'));
  await t.throwsAsync(() => v.validate('a@b', 'email'));
  await t.throwsAsync(() => v.validate('*', 'email'));
});

test('permissions', async (t: ExecutionContext<Context>) => {
  const { validator: v } = t.context;
  v.registerValidator({ macro: 'permissions' }, 'permissions');

  t.true(await v.validate(['common.user.list'], 'permissions'));
  t.true(await v.validate(['userList.list'], 'permissions'));
  await t.throwsAsync(() => v.validate(['userList.list', '<script>alert();</script>'], 'permissions'));
  await t.throwsAsync(() => v.validate(['user:list'], 'permissions'));
  await t.throwsAsync(() => v.validate([424242], 'permissions'));
});

test('serial', async (t: ExecutionContext<Context>) => {
  const { validator: v } = t.context;
  v.registerValidator({ macro: 'serial' }, 'serial');

  t.true(await v.validate(42, 'serial'));

  // 2147483647 is max int4 value in PostgreSQL
  t.true(await v.validate(2147483647, 'serial'));
  await t.throwsAsync(() => v.validate(2147483647 + 1, 'serial'));
});

test('timestamp', async (t: ExecutionContext<Context>) => {
  const { validator: v } = t.context;
  v.registerValidator({ macro: 'timestamp' }, 'ts');

  t.true(await v.validate('2020-01-01T00:00:00Z', 'ts'));
  t.true(await v.validate('2020-01-01 00:00:00Z', 'ts'));
  t.true(await v.validate('2020-01-01T00:00:00+0100', 'ts'));
  t.true(await v.validate('2020-01-01T00:00:00-0530', 'ts'));
  await t.throwsAsync(() => v.validate('2020-01-01', 'ts'));
  await t.throwsAsync(() => v.validate('2020/01/01', 'ts'));
  await t.throwsAsync(() => v.validate('01/01/2020', 'ts'));
});

test('uuid', async (t: ExecutionContext<Context>) => {
  const { validator: v } = t.context;
  v.registerValidator({ macro: 'uuid' }, 'uuid');

  t.true(await v.validate('fb765772-0b28-4acd-b1b7-20ad958df863', 'uuid'));
  t.true(await v.validate('FB765772-0B28-4ACD-B1B7-20AD958DF863', 'uuid'));
  await t.throwsAsync(() => v.validate('abcd', 'uuid'));
});
