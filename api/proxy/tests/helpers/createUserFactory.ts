import { PoolClient } from '@ilos/connection-postgres';
import { CryptoProvider } from '@pdc/provider-crypto';

export async function createOperatorAdminSqlFactory(
  pgClient: PoolClient,
  crypto: CryptoProvider,
  operator_id: number,
): Promise<any> {
  const user = await pgClient.query({
    text: `
      INSERT INTO auth.users
      (email, password, firstname, lastname, role, status, operator_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING _id
    `,
    values: [
      `operator_${operator_id}@example.com`,
      await crypto.cryptPassword('admin1234'),
      `operator ${operator_id}`,
      'Example',
      'operator.admin',
      'active',
      operator_id,
    ],
  });

  return user.rows[0];
}
