import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import {
  ApplicationCooldownConstraint,
  CeeApplication,
  CeeJourneyTypeEnum,
  CeeRepositoryProviderInterfaceResolver,
  LongCeeApplication,
  RegisteredCeeApplication,
  SearchCeeApplication,
  SearchJourney,
  ShortCeeApplication,
  ValidJourney,
  ValidJourneyConstraint,
} from '../interfaces';

@provider({
  identifier: CeeRepositoryProviderInterfaceResolver,
})
export class CeeRepositoryProvider extends CeeRepositoryProviderInterfaceResolver {
  public readonly table = 'cee.cee_applications';
  public readonly carpoolTable = 'carpool.carpools';
  public readonly identityTable = 'carpool.identities';

  constructor(protected connection: PostgresConnection) {
    super();
  }

  protected async searchForApplication(
    journeyType: CeeJourneyTypeEnum,
    search: SearchCeeApplication,
    constraint: ApplicationCooldownConstraint,
  ): Promise<RegisteredCeeApplication | void> {
    const query = {
      text: `
        SELECT
          _id,
          operator_id,
          datetime
        FROM ${this.table}
        WHERE 
          journey_type = $1::cee.journey_type_enum AND
          datetime >= ($6::timestamp - $4::int * interval '1 year') AND
          is_specific = false AND (
            (last_name_trunc = $2 AND phone_trunc = $3)
            ${search.driving_license ? 'OR driving_license = $7' : ''}
          )
        UNION
        SELECT
          _id,
          operator_id,
          datetime
        FROM ${this.table}
        WHERE
          journey_type = $1::cee.journey_type_enum AND
          datetime >= ($6::timestamp - $5::int * interval '1 year') AND
          is_specific = true AND (
            (last_name_trunc = $2 AND phone_trunc = $3)
            ${search.driving_license ? 'OR driving_license = $7' : ''}
          )
        ORDER BY datetime DESC
        LIMIT 1
      `,
      values: [
        journeyType,
        search.last_name_trunc,
        search.phone_trunc,
        journeyType === CeeJourneyTypeEnum.Short ? constraint.short.standardized : constraint.long.standardized,
        journeyType === CeeJourneyTypeEnum.Short ? constraint.short.specific : constraint.long.specific,
        new Date(),
        ...(search.driving_license ? [search.driving_license] : []),
      ],
    };
    const result = await this.connection.getClient().query<RegisteredCeeApplication>(query);
    return result.rows[0];
  }

  async searchForShortApplication(search: SearchCeeApplication, constraint: ApplicationCooldownConstraint): Promise<RegisteredCeeApplication | void> {
    return await this.searchForApplication(CeeJourneyTypeEnum.Short, search, constraint);
  }

  async searchForLongApplication(search: SearchCeeApplication, constraint: ApplicationCooldownConstraint): Promise<RegisteredCeeApplication | void> {
    return await this.searchForApplication(CeeJourneyTypeEnum.Long, search, constraint);
  }

  async searchForValidJourney(search: SearchJourney, constraint: ValidJourneyConstraint): Promise<ValidJourney> {
    const query = {
      text: `
        SELECT
          cc._id AS carpool_id,
          ci.phone_trunc AS phone_trunc,
          cc.datetime + cc.duration * interval '1 second' AS datetime,
          cc.status AS status
        FROM ${this.carpoolTable} AS cc
        JOIN ${this.identityTable} AS ci
          ON cc.identity_id = ci._id
        LEFT JOIN ${this.table} ce ON ce.carpool_id = cc._id
        WHERE
          cc.operator_id = $1 AND
          cc.operator_journey_id = $2 AND
          cc.operator_class = $3 AND
          cc.datetime >= $4 AND
          cc.datetime < $5 AND
          cc.distance <= $6 AND
          (cc.start_geo_code NOT LIKE $7 OR cc.end_geo_code NOT LIKE $7) AND
          cc.is_driver = true AND
          ce._id IS NULL
        ORDER BY cc.datetime DESC
        LIMIT 1
      `,
      values: [
        search.operator_id,
        search.operator_journey_id,
        constraint.operator_class,
        constraint.start_date,
        constraint.end_date,
        constraint.max_distance,
        constraint.geo_pattern,
      ],
    };

    const result = await this.connection.getClient().query<ValidJourney>(query);
    if (!result.rows.length) {
      throw new Error();
    }
    return result.rows[0];
  }

  protected async registerApplication(
    journeyType: CeeJourneyTypeEnum,
    data: ShortCeeApplication | LongCeeApplication | CeeApplication,
    constraint?: ApplicationCooldownConstraint,
  ): Promise<void> {
    const fields = [
      ['journey_type', 'cee.journey_type_enum'],
      ['operator_id', 'int'],
      ['last_name_trunc', 'varchar'],
      ['phone_trunc', 'varchar'],
      ['datetime', 'timestamp'],
    ];
    const values: Array<any> = [journeyType, data.operator_id, data.last_name_trunc, data.phone_trunc, data.datetime];

    if (constraint) {
      if (journeyType === CeeJourneyTypeEnum.Long || journeyType === CeeJourneyTypeEnum.Short) {
        fields.push(['driving_license', 'varchar']);
        values.push('driving_license' in data ? data.driving_license : undefined);
      }
      if (journeyType === CeeJourneyTypeEnum.Short) {
        fields.push(['carpool_id', 'int']);
        values.push('carpool_id' in data ? data.carpool_id : undefined);
      }
    } else {
      fields.push(['is_specific', 'boolean']);
      values.push(true);
    }

    const query = {
      text: `
        INSERT INTO ${this.table} (${fields.map(([f]) => f).join(',')})
        SELECT tmp.* FROM (
          SELECT
            ${fields.map(([f, c], i) => `$${i + 1}::${c} as ${f}`).join(',')}
          ) AS tmp
      `,
      values,
    };

    if (constraint) {
      query.text = `
        ${query.text}
        LEFT JOIN ${this.table} AS ce on 
          ce.journey_type = tmp.journey_type AND
          (
            (ce.last_name_trunc = tmp.last_name_trunc AND ce.phone_trunc = tmp.phone_trunc) OR
             ce.driving_license = tmp.driving_license
          ) AND
          ce.datetime >= tmp.datetime::timestamp - '3 years'::interval
        WHERE ce._id IS NULL;
      `;
    }
    const result = await this.connection.getClient().query(query);
    if (result.rowCount !== 1) {
      throw new Error();
    }
    return;
  }

  async registerShortApplication(data: ShortCeeApplication, constraint: ApplicationCooldownConstraint): Promise<void> {
    return this.registerApplication(CeeJourneyTypeEnum.Short, data, constraint);
  }

  async registerLongApplication(data: LongCeeApplication, constraint: ApplicationCooldownConstraint): Promise<void> {
    return this.registerApplication(CeeJourneyTypeEnum.Long, data, constraint);
  }

  async importApplication(data: CeeApplication & { journey_type: CeeJourneyTypeEnum }): Promise<void> {
    const { journey_type, ...application } = data;
    return this.registerApplication(journey_type, application);
  }
}
