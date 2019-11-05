import { PostgresConnection } from '@ilos/connection-postgres';
// import { describe } from 'mocha';
import { expect } from 'chai';
import { ConfigInterfaceResolver } from '@ilos/common';

import { AuthRepositoryProvider } from './AuthRepositoryProvider';
import { CryptoProvider, CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';
import { AuthRepositoryProviderInterface } from '../interfaces/AuthRepositoryProviderInterface';

class Config extends ConfigInterfaceResolver {
  config = {
    confirmation: 7 * 86400,
    invitation: 7 * 86400,
    reset: 1 * 86400,
  };
  get(k: string, fb: string) {
    const key = k.split('.').pop();
    console.log(key);
    if (key in this.config) {
      console.log(this.config[key]);
      return this.config[key];
    }
    return fb;
  }
}

describe('Auth pg repository', () => {
  let repository: AuthRepositoryProviderInterface;
  let connection;
  let id;
  const email = 'toto@toto.com';
  const getUser = async function(customEmail = email) {
    const result = await connection.getClient().query({
      text: 'SELECT * from auth.users where email = $1',
      values: [customEmail],
    });
    return result.rows[0];
  };

  before(async () => {
    connection = new PostgresConnection({
      connectionString:
        'APP_POSTGRES_URL' in process.env
          ? process.env.APP_POSTGRES_URL
          : 'postgresql://postgres:postgres@localhost:5432/pdc-local',
    });

    await connection.up();

    repository = new AuthRepositoryProvider(
      connection,
      (<unknown>new CryptoProvider()) as CryptoProviderInterfaceResolver,
      new Config(),
    );

    const result = await connection.getClient().query({
      text: 'INSERT INTO auth.users (email, firstname, lastname, role) values ($1, $2, $3, $4) RETURNING _id',
      values: [email, 'toto', 'tata', 'admin'],
    });
    id = result.rows[0]._id;
  });

  after(async () => {
    if (id) {
      await connection.getClient().query({
        text: `DELETE FROM ${repository.table} WHERE _id = $1`,
        values: [id],
      });
    }
    await connection.down();
  });

  it('should create token by email', async () => {
    const token = await repository.createTokenByEmail(email, 'confirmation');
    const user = await getUser();

    expect(user.token).to.eq(token);
    expect(user.status).to.eq('pending');
    // expect(user.token_expires_at).to.eq(new Date()); // TODO ROUND :)
  });

  it('should clear token by email', async () => {
    const success = await repository.clearTokenByEmail(email);
    const user = await getUser();

    expect(success).to.eq(true);
    expect(user.token).to.eq(null);
    expect(user.token_expires_at).to.eq(null);
    expect(user.status).to.eq('pending');
  });

  it('should challenge token by email', async () => {
    const token = await repository.createTokenByEmail(email, 'confirmation');
    const success = await repository.challengeTokenByEmail(email, token);
    expect(success).to.eq(true);

    const user = await getUser();
    expect(user.token).to.eq(null);
    expect(user.token_expires_at).to.eq(null);
    // expect(user.status).to.eq('pending'); // TODO

    const failure = await repository.challengeTokenByEmail(email, token);
    expect(failure).to.eq(false);
  });

  it('should update password by id', async () => {
    const password = '12345';
    const result = await repository.updatePasswordById(id, password);
    expect(result).to.eq(true);

    const user = await getUser();
    expect(user.password).not.to.eq(null);
  });

  it('should update password by email', async () => {
    const password = '12345';
    const result = await repository.updatePasswordByEmail(email, password);
    expect(result).to.eq(true);

    const user = await getUser();
    expect(user.password).not.to.eq(null);
  });

  it('should challenge password by id', async () => {
    const password = '12345';
    const result = await repository.updatePasswordById(id, password);
    expect(result).to.eq(true);

    const success = await repository.challengePasswordById(id, password);
    expect(success).to.eq(true);

    const failure = await repository.challengePasswordById(id, 'not_the_password');
    expect(failure).to.eq(false);
  });

  it('should challenge password by email', async () => {
    const password = '12345';
    const result = await repository.updatePasswordById(id, password);
    expect(result).to.eq(true);

    const success = await repository.challengePasswordByEmail(email, password);
    expect(success).to.eq(true);

    const failure = await repository.challengePasswordByEmail(email, 'not_the_password');
    expect(failure).to.eq(false);
  });

  it('should update email by id', async () => {
    const email = 'tata@tata.com';
    const token = await repository.updateEmailById(id, email);

    const user = await getUser(email);
    expect(user.token).to.eq(token);
    expect(user.status).to.eq('pending');
  });
});
