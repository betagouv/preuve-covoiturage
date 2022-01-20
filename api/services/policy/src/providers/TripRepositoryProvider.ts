import { promisify } from 'util';
import { provider } from '@ilos/common';
import { PostgresConnection, Cursor } from '@ilos/connection-postgres';
import { v4 } from 'uuid';

import { TripRepositoryProviderInterface, TripRepositoryProviderInterfaceResolver, TripInterface } from '../interfaces';
import { ProcessableCampaign } from '../engine/ProcessableCampaign';

@provider({
  identifier: TripRepositoryProviderInterfaceResolver,
})
export class TripRepositoryProvider implements TripRepositoryProviderInterface {
  public readonly table = 'policy.trips';

  constructor(protected connection: PostgresConnection) {}

  async listApplicablePoliciesId(): Promise<number[]> {
    const results = await this.connection.getClient().query("SELECT _id FROM policy.policies WHERE status = 'active'");
    return results.rows.map((r) => r._id);
  }

  /**
   * Find trips by policy
   *
   * This AsyncGenerator works in 2 ways
   * 1. find all trips matching a policy where no incentive has been calculated
   * 2. find all trips matching a policy from a given date (overrides results)
   *
   * Criterions to match a policy :
   * 1. trip's datetime must be within range
   * 2. start_territory OR end_territory must be within the policy's territory
   *
   * The queries are split in different stages and written on an unlogged table
   * for performance. Cleanup is done manually at the end of the call.
   *
   * Query stages
   * 1. find all children territories of the AOM (policy.territory_id) as
   *    carpool.start_territory_id and carpool.end_territory_id are at town level.
   *    The int array is used on every line to filter carpools.
   * 2. Create an unlogged table with all the matching carpools (datetime, territory_id).
   *    When overrideFrom exists, it is used as start_date and ALL trips are returned.
   *    When it is missing, only carpools without calculated incentives are returned.
   * 3. Add indexes on the unlogged table for faster joins
   * 4. Create 2 unlogged tables for start and end territories. We use the list of
   *    territory ancestors in the output and need to calculate it for each row.
   *    These queries do the lookup once for all start and end territory IDs of all
   *    carpools from the created unlogged table.
   * 5. Create indexes on these tables
   * 6. Format the results as [driver_json, passenger_json] rows with the joined
   *    start and end territory ancestors' lists.
   *
   * The AsyncGenerator yields calculations within a loop iterating over the Cursor.
   */
  async *findTripByPolicy(
    policy: ProcessableCampaign,
    batchSize = 100,
    overrideFrom?: Date,
  ): AsyncGenerator<TripInterface[], void, void> {
    // generate unique name for temporary table
    const tableName = `trips_${policy.policy_id}_${v4().replace(/-/g, '')}`;
    console.debug(`TABLE NAME: ${tableName}`);

    // fetch descendants first to improve performance
    const descendantsRes = await this.connection.getClient().query({
      text: `SELECT unnest(territory.get_descendants(array[$1::int])) _id`,
      values: [policy.territory_id],
    });

    const descendants = descendantsRes.rowCount ? descendantsRes.rows.map((r) => r._id) : [];

    const s = new Date();

    await this.connection.getClient().query({
      text: `
        CREATE UNLOGGED TABLE ${tableName} AS (
          SELECT pt.*
          FROM ${this.table} pt
          LEFT JOIN policy.incentives pi
            ON pt.carpool_id = pi.carpool_id
            AND pi.policy_id = $4::int
            WHERE
              pt.datetime >= $1::timestamp AND pt.datetime < $2::timestamp
              AND pt.carpool_status = 'ok'::carpool.carpool_status_enum
              ${overrideFrom ? '' : 'AND pi.carpool_id IS NULL'}
              AND (
                pt.start_territory_id = ANY($3::int[])
                OR
                pt.end_territory_id = ANY($3::int[])
              )
      )
      `,
      values: [overrideFrom || policy.start_date, policy.end_date, descendants, policy.policy_id],
    });

    console.debug(`CREATE TABLE in ${new Date().getTime() - s.getTime()}ms`);

    const s2 = new Date();
    await this.connection.getClient().query(`CREATE INDEX ON ${tableName} (start_territory_id)`);
    await this.connection.getClient().query(`CREATE INDEX ON ${tableName} (end_territory_id)`);
    console.debug(`CREATE INDEXES in ${new Date().getTime() - s2.getTime()}ms`);

    const s3 = new Date();
    await this.connection.getClient().query(`
      CREATE UNLOGGED TABLE ${tableName}_start AS (
        SELECT
          start_territory_id AS territory_id,
          start_territory_id || territory.get_ancestors(ARRAY[cc.start_territory_id]) ancestors
        FROM (SELECT distinct start_territory_id FROM ${tableName}) cc
      )
    `);

    await this.connection.getClient().query(`
      CREATE UNLOGGED TABLE ${tableName}_end AS (
        SELECT
          end_territory_id AS territory_id,
          end_territory_id || territory.get_ancestors(ARRAY[cc.end_territory_id]) ancestors
        FROM (SELECT distinct end_territory_id FROM ${tableName}) cc
      )
    `);
    console.debug(`CREATE START/END TABLES in ${new Date().getTime() - s3.getTime()}ms`);

    const s4 = new Date();
    await this.connection.getClient().query(`CREATE INDEX ON ${tableName}_start (territory_id)`);
    await this.connection.getClient().query(`CREATE INDEX ON ${tableName}_end (territory_id)`);
    console.debug(`CREATE INDEXES in ${new Date().getTime() - s4.getTime()}ms`);

    const query = {
      text: `
        SELECT
          json_agg(
            json_build_object(
              'identity_uuid', t.identity_uuid,
              'carpool_id', t.carpool_id,
              'trip_id', t.trip_id,
              'operator_id', t.operator_id,
              'operator_class', t.operator_class,
              'is_over_18', t.is_over_18,
              'is_driver', t.is_driver,
              'has_travel_pass', t.has_travel_pass,
              'datetime', t.datetime,
              'seats', t.seats,
              'duration', t.duration,
              'distance', t.distance,
              'cost', t.cost,
              'start_insee', t.start_insee,
              'end_insee', t.end_insee,
              'start_territory_id', t_start.ancestors,
              'end_territory_id', t_end.ancestors
            )
          ) AS people
          FROM ${tableName} t
          LEFT JOIN ${tableName}_start t_start
            ON t.start_territory_id = t_start.territory_id
          LEFT JOIN ${tableName}_end t_end
            ON t.end_territory_id = t_end.territory_id
          GROUP BY t.acquisition_id
          ORDER BY min(t.datetime) ASC
      `,
      values: [],
    };

    const client = await this.connection.getClient().connect();
    const cursor = client.query(new Cursor(query.text, query.values));
    const promisifiedCursorRead = promisify(cursor.read.bind(cursor));

    let count = 0;
    do {
      try {
        const rows = await promisifiedCursorRead(batchSize);
        count = rows.length;
        if (count > 0) {
          yield [
            ...rows.map(
              (r) => new TripInterface(...r.people.map((rp) => ({ ...rp, datetime: new Date(rp.datetime) }))),
            ),
          ];
        }
      } catch (e) {
        await this.dropTmpTables(tableName);
        cursor.close(() => client.release());
        throw e;
      }
    } while (count > 0);

    // done
    await this.dropTmpTables(tableName);
    cursor.close(() => client.release());
    console.debug(`CURSOR RELEASED: ${tableName}`);
  }

  private async dropTmpTables(tableName: string): Promise<void> {
    await this.connection.getClient().query(`DROP TABLE IF EXISTS ${tableName}`);
    await this.connection.getClient().query(`DROP TABLE IF EXISTS ${tableName}_start`);
    await this.connection.getClient().query(`DROP TABLE IF EXISTS ${tableName}_end`);
    console.debug(`DROP TABLES ${tableName}/_start/_end`);
  }
}
