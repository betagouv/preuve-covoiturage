import { command, CommandInterface, CommandOptionType } from '@ilos/common';
import { PoolClient, PostgresConnection } from '@ilos/connection-postgres';
import { startOfMonth, subMonths, add } from 'date-fns';
import { promisify } from 'util';
import { cpus } from 'os';

interface CommandOptions {
  databaseUri: string;
  from: Date;
  to: Date;
  timespan: number;
  radius: number;
  aom?: string;
  siret?: string;
}

@command()
export class SearchCollisionsCommand implements CommandInterface {
  static readonly signature: string = 'search:collisions';
  static readonly description: string = 'Detect inter-operator collisions';
  static readonly options: CommandOptionType[] = [
    {
      signature: '-u, --database-uri <uri>',
      description: 'Postgres connection string',
      default: process.env.APP_POSTGRES_URL,
    },
    {
      // default start datetime is the beginning of last month
      // start datetime is inclusive (datetime >= start_datetime)
      signature: '-f, --from <from>',
      description: 'Get trips from date',
      default: (() => subMonths(startOfMonth(new Date()), 1))(),
      coerce: (s: string): Date => new Date(s),
    },
    {
      // default end datetime is the beginning of the current month
      // which makes a 1 month search window.
      // end datetime is exclusive (datetime < end_datetime)
      signature: '-t, --to <to>',
      description: 'Get trips until date',
      default: (() => startOfMonth(new Date()))(),
      coerce: (s: string): Date => new Date(s),
    },
    {
      // Territory name we'll search for and get the SIRET for
      // the final query.
      // Works with AOM only (l_aom column)
      signature: '--aom <aom>',
      description: 'AOM name',
    },
    {
      // better solution, pass the SIRET directly
      // Works with AOM ony (aom column)
      signature: '--siret <siret>',
      description: 'Territory SIRET (used in geo.perimeters table)',
    },
    {
      // 30 minutes = 15 minutes before and 15 minutes after the
      // trip start_datetime
      signature: '--timespan <timespan>',
      description: 'Search timespan in minutes (default 30 minutes)',
      default: 30,
      coerce: (s: string): number => Number(s),
    },
    {
      signature: '--radius <radius>',
      description: 'Search radius in meters (default: 1000)',
      default: 1000,
      coerce: (s: string): number => Number(s),
    },
  ];

  private slice = { hours: 4 };
  private MAX_POOLS = cpus().length - 1;

  public async call(options: CommandOptions): Promise<void> {
    const pools = await this.dbSetup(options);
    const { from, to, ...opts } = await this.normalizeOptions(pools[0], options);

    let f = new Date(from.getTime());
    let t = add(f, this.slice);

    const queries = [];
    let index = 0;
    while (f.getTime() < to.getTime()) {
      queries.push(this.searchCollisions(pools[index % this.MAX_POOLS], { from: f, to: t, ...opts }));

      f = add(f, this.slice);
      t = add(f, this.slice);
      index++;
    }

    const slices = await Promise.all(queries);
    let fraud = 0;
    let total = 0;
    slices.forEach((slice) => {
      fraud += parseInt(slice.fraud, 10);
      total += parseInt(slice.total, 10);
    });

    console.debug({
      // slices,
      from,
      to,
      fraud,
      total,
      percent: `${((fraud / total) * 100).toFixed(2)}%`,
    });

    await this.dbTeardown(pools);
  }

  private async searchCollisions(pool: PostgresConnection, options: CommandOptions): Promise<any> {
    const { from, to, siret, timespan, radius } = options;
    const db = await pool.getClient().connect();

    // console.debug(`Searching btw ${from.toISOString()} and ${to.toISOString()}`);

    const values = [from, to, `${timespan} minutes`, radius, siret].filter((i) => !!i);
    const text = `
      WITH group_phones AS (
        select
          ci.phone_trunc,
          array_agg(distinct cc._id) as carpool_id
        from carpool.identities ci
        join carpool.carpools cc on ci._id = cc.identity_id
        ${
          siret
            ? `
              join geo.perimeters gps on cc.start_geo_code = gps.arr
              join geo.perimeters gpe on cc.end_geo_code = gpe.arr
            `
            : ''
        }
        where
          cc.datetime >= $1 and cc.datetime < $2
          and phone_trunc is not null
          ${
            siret
              ? `
                  and (gps.aom = $5 or gpe.aom = $5)
                  and gps.year = extract(year from cc.datetime)
                  and gpe.year = extract(year from cc.datetime)
              `
              : ''
          }
        group by phone_trunc
        having array_length(array_agg(distinct cc._id), 1) > 1
      ),
      carpool_list AS (
        select unnest(carpool_id) carpool_id
        from group_phones
        group by carpool_id
        order by carpool_id
      ),
      group_time_geo AS (
        select
          cc._id AS carpool_id,
          array_agg(distinct cc._id) || array_agg(cc2._id) pack
        from group_phones gp
        join lateral unnest(gp.carpool_id) as lat(carpool_id) on true
        join carpool.carpools cc on cc._id = lat.carpool_id
        join lateral (
          select cci.*
          from carpool.carpools cci
          where
                cci.datetime >= cc.datetime - $3::interval
            and cci.datetime <= cc.datetime + $3::interval
            and cci.datetime + (cci.duration || ' seconds')::interval >= cc.datetime + (cc.duration || ' seconds')::interval - $3::interval
            and cci.datetime + (cci.duration || ' seconds')::interval <= cc.datetime + (cc.duration || ' seconds')::interval + $3::interval
            and cci._id <> cc._id
            and cci._id in (select carpool_id from carpool_list)
            and cci.operator_id <> cc.operator_id
            and st_distance(cc.start_position, cci.start_position) < $4
            and st_distance(cc.end_position, cci.end_position) < $4
        ) cc2 on true
        group by cc._id
      )
      select count(distinct carpool_id) from group_time_geo;
    `;

    const fraudRes = await db.query({ text, values });
    const fraudCount = fraudRes.rowCount ? fraudRes.rows[0].count : 0;

    const totalRes = await db.query({
      text: `
          SELECT count(*)
          FROM carpool.carpools cc
          ${
            siret
              ? `
                join geo.perimeters gps on cc.start_geo_code = gps.arr
                join geo.perimeters gpe on cc.end_geo_code = gpe.arr
              `
              : ''
          }
          WHERE
            datetime >= $1 AND datetime < $2
            ${
              siret
                ? `
                    and (gps.aom = $3 or gpe.aom = $3)
                    and gps.year = extract(year from cc.datetime)
                    and gpe.year = extract(year from cc.datetime)
                `
                : ''
            }
    `,
      values: [from, to, siret].filter((i) => !!i),
    });

    const totalCount = totalRes.rowCount ? totalRes.rows[0].count : 1;

    db.release();
    // console.debug(`Done btw ${from.toISOString()} and ${to.toISOString()}: ${fraudCount}/${totalCount}`);

    return {
      from,
      to,
      fraud: fraudCount,
      total: totalCount,
      percent: `${((fraudCount / totalCount) * 100).toFixed(2)}%`,
    };
  }

  private async normalizeOptions(pool: PostgresConnection, options: CommandOptions): Promise<CommandOptions> {
    let { aom, siret } = options;
    const hasName = (name: string): boolean => name && !!name.length;
    const hasSiret = (siret: string): boolean => siret && !!siret.length;

    // search for AOM SIRET if the name is given
    if (hasName(aom) && !hasSiret(siret)) {
      const db = await pool.getClient().connect();
      const res = await db.query({
        text: `
          SELECT
            l_aom AS name,
            aom   AS siret
          FROM geo.perimeters
          WHERE lower(l_aom) LIKE $1
        `,
        values: [`%${aom.trim()}%`],
      });

      aom = res.rowCount ? res.rows[0].name : null;
      siret = res.rowCount ? res.rows[0]?.siret : null;

      db.release();
    }

    return { ...options, aom, siret };
  }

  private async dbSetup(options: Partial<CommandOptions>): Promise<PostgresConnection[]> {
    let index = 0;
    const pools = [];
    while (index < this.MAX_POOLS) {
      const pg = new PostgresConnection({ connectionString: options.databaseUri });
      await pg.up();
      pools[index] = pg;
      index++;
    }

    return pools;
  }

  private async dbTeardown(pools: PostgresConnection[]): Promise<void> {
    await Promise.all(pools.map((p) => p.down()));
  }
}
