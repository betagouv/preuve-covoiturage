import { PoolClient } from '@ilos/connection-postgres';

import { Generator } from './Generator';
import { identities } from '../identities';

interface Identity {
  _id: number;
  uuid: string;
  phone: string;
  phone_trunc: string;
  operator_user_id: string;
  firstname?: string;
  email?: string;
  over_18: boolean | null;
}

// we wanna have a version with phone and another one with phone_trunc + operator_user_id
type WithPhone = Omit<Identity, 'phone_trunc' | 'operator_user_id'>;
type WithPhoneTrunc = Omit<Identity, 'phone'>;
export type IdentityInterface = WithPhone | WithPhoneTrunc;

export class IdentityGenerator extends Generator<IdentityInterface> {
  private table = 'carpool.identities';

  constructor(protected pool: PoolClient, ...args: any[]) {
    super(pool);
  }

  async run(items: IdentityInterface[] = null): Promise<void> {
    items = items || (await IdentityGenerator.all());

    try {
      await this.pool.query('BEGIN');

      for (const item of items) {
        if ('phone' in item) {
          await this.pool.query({
            text: `
              INSERT INTO ${this.table}
              (_id, uuid, phone, firstname, email, over_18)
              VALUES ($1, $2, $3, $4, $5, $6)
            `,
            values: [item._id, item.uuid, item.phone, item.firstname, item.email, item.over_18],
          });
        } else if ('phone_trunc' in item) {
          await this.pool.query({
            text: `
              INSERT INTO ${this.table}
              (_id, uuid, phone_trunc, operator_user_id, firstname, email, over_18)
              VALUES ($1, $2, $3, $4, $5, $6, $7)
            `,
            values: [
              item._id,
              item.uuid,
              item.phone_trunc,
              item.operator_user_id,
              item.firstname,
              item.email,
              item.over_18,
            ],
          });
        }
      }

      await this.pool.query('COMMIT');
    } catch (e) {
      await this.pool.query('ROLLBACK');
      console.log(`IdentityGenerator insert failed: ${e.message}`);
      throw e;
    }
  }

  static async all(): Promise<IdentityInterface[]> {
    return identities;
  }
}
