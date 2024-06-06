import { anyTest, TestFn } from '@/dev_deps.ts';
import { ConfigInterfaceResolver } from '@/ilos/common/index.ts';
import { PostgresConnection } from '@/ilos/connection-postgres/index.ts';
import { CryptoProvider, CryptoProviderInterfaceResolver } from '@/pdc/providers/crypto/index.ts';

import { AuthRepositoryProvider } from './AuthRepositoryProvider.ts';

interface TestContext {
  connection: PostgresConnection;
  provider: AuthRepositoryProvider;
  getUser: (email?: string) => Promise<any>;
  id: number;
  email: string;
}

const test = anyTest as TestFn<TestContext>;

test.before.skip(async (t) => {
  t.context.email = 'toto@toto.com';

  class Config extends ConfigInterfaceResolver {
    config = {
      confirmation: 7 * 86400,
      invitation: 7 * 86400,
      reset: 1 * 86400,
    };
    get<T>(k: string, fb: T): T {
      const key = k.split('.').pop();
      if (key in this.config) {
        return this.config[key];
      }
      return fb;
    }
  }

  t.context.connection = new PostgresConnection({
    connectionString:
      'APP_POSTGRES_URL' in process.env
        ? process.env.APP_POSTGRES_URL
        : 'postgresql://postgres:postgres@localhost:5432/local',
  });

  await t.context.connection.up();

  t.context.provider = new AuthRepositoryProvider(
    t.context.connection,
    new CryptoProvider() as unknown as CryptoProviderInterfaceResolver,
    new Config(),
  );

  const result = await t.context.connection.getClient().query({
    text: 'INSERT INTO auth.users (email, firstname, lastname, role) values ($1, $2, $3, $4) RETURNING _id',
    values: [t.context.email, 'toto', 'tata', 'admin'],
  });

  t.context.id = result.rows[0]._id;
  t.context.getUser = async function (customEmail = t.context.email): Promise<any> {
    const result = await t.context.connection.getClient().query({
      text: 'SELECT * from auth.users where email = $1',
      values: [customEmail],
    });
    return result.rows[0];
  };
});

test.after.always.skip(async (t) => {
  if (t.context.id) {
    await t.context.connection.getClient().query({
      text: `DELETE FROM ${t.context.provider.table} WHERE _id = $1`,
      values: [t.context.id],
    });
  }
  await t.context.connection.down();
});

test.serial.skip('should create token by email', async (t) => {
  await t.context.provider.createTokenByEmail(t.context.email, 'confirmation');
  const user = await t.context.getUser();
  t.true(/^\$2a\$10\$/.test(user.token));
  t.is(user.status, 'pending');
  t.true(user.token_expires_at instanceof Date);
});

test.serial.skip('should clear token by email', async (t) => {
  const success = await t.context.provider.clearTokenByEmail(t.context.email);
  const user = await t.context.getUser();

  t.true(success);
  t.is(user.token, null);
  t.is(user.token_expires_at, null);
  t.is(user.status, 'pending');
});

test.serial.skip('should challenge token by email', async (t) => {
  const token = await t.context.provider.createTokenByEmail(t.context.email, 'confirmation');
  const success = await t.context.provider.challengeTokenByEmail(t.context.email, token);
  t.true(success);
});

test.serial.skip('should update password by id', async (t) => {
  const password = '12345';
  const result = await t.context.provider.updatePasswordById(t.context.id, password);
  t.true(result);

  const user = await t.context.getUser();
  t.not(user.password, null);
});

test.serial.skip('should update password by email', async (t) => {
  const password = '12345';
  const result = await t.context.provider.updatePasswordByEmail(t.context.email, password);
  t.true(result);

  const user = await t.context.getUser();
  t.not(user.password, null);
});

test.serial.skip('should challenge password by id', async (t) => {
  const password = '12345';
  const result = await t.context.provider.updatePasswordById(t.context.id, password);
  t.true(result);

  const success = await t.context.provider.challengePasswordById(t.context.id, password);
  t.true(success);

  const failure = await t.context.provider.challengePasswordById(t.context.id, 'not_the_password');
  t.false(failure);
});

test.serial.skip('should challenge password by email', async (t) => {
  const password = '12345';
  const result = await t.context.provider.updatePasswordById(t.context.id, password);
  t.true(result);

  const success = await t.context.provider.challengePasswordByEmail(t.context.email, password);
  t.true(success);

  const failure = await t.context.provider.challengePasswordByEmail(t.context.email, 'not_the_password');
  t.true(failure);
});

test.serial.skip('should update email by id', async (t) => {
  const courriel = `toto-${Math.random() * 1000}@example.com`;
  await t.context.provider.updateEmailById(t.context.id, courriel);

  const user = await t.context.getUser(courriel);
  t.true(/\$2a\$10/.test(user.token));
  t.is(user.status, 'pending');
});
