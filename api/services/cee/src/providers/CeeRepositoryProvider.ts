import { NotFoundException } from '@ilos/common';
import { ConflictException } from '@ilos/common';
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

  async searchForShortApplication(
    search: SearchCeeApplication,
    constraint: ApplicationCooldownConstraint,
  ): Promise<RegisteredCeeApplication | void> {
    return await this.searchForApplication(CeeJourneyTypeEnum.Short, search, constraint);
  }

  async searchForLongApplication(
    search: SearchCeeApplication,
    constraint: ApplicationCooldownConstraint,
  ): Promise<RegisteredCeeApplication | void> {
    return await this.searchForApplication(CeeJourneyTypeEnum.Long, search, constraint);
  }

  async searchForValidJourney(search: SearchJourney, constraint: ValidJourneyConstraint): Promise<ValidJourney> {
    const query = {
      text: `
        SELECT
          cc.acquisition_id AS acquisition_id,
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
      throw new NotFoundException(`${query.text} ${query.values.join(', ')}`);
    }
    return result.rows[0];
  }

  protected async registerApplication(
    journeyType: CeeJourneyTypeEnum,
    data: ShortCeeApplication | LongCeeApplication | CeeApplication,
    constraint?: ApplicationCooldownConstraint,
  ): Promise<string> {
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
        LEFT JOIN ${this.table} AS cep on 
          cep.is_specific = true AND
          cep.journey_type = tmp.journey_type AND
          (
            (cep.last_name_trunc = tmp.last_name_trunc AND cep.phone_trunc = tmp.phone_trunc) OR
             cep.driving_license = tmp.driving_license
          ) AND
          cep.datetime >= tmp.datetime::timestamp - $${values.length + 1} * interval '1 year'
        LEFT JOIN ${this.table} AS ced on 
          ced.is_specific = false AND
          ced.journey_type = tmp.journey_type AND
          (
            (ced.last_name_trunc = tmp.last_name_trunc AND ced.phone_trunc = tmp.phone_trunc) OR
             ced.driving_license = tmp.driving_license
          ) AND
          ced.datetime >= tmp.datetime::timestamp - $${values.length + 2} * interval '1 year'
        WHERE
          cep._id IS NULL AND
          ced._id IS NULL
      `;
      values.push(journeyType === CeeJourneyTypeEnum.Short ? constraint.short.specific : constraint.long.specific);
      values.push(
        journeyType === CeeJourneyTypeEnum.Short ? constraint.short.standardized : constraint.long.standardized,
      );
    }

    query.text = `${query.text} RETURNING _id`;
    const result = await this.connection.getClient().query(query);
    if (result.rowCount !== 1) {
      // s'il n'y a pas eu d'enregistrement c'est qu'un autre est déjà actif
      throw new ConflictException();
    }
    return result.rows[0]?._id;
  }

  async registerShortApplication(
    data: ShortCeeApplication,
    constraint: ApplicationCooldownConstraint,
  ): Promise<string> {
    return this.registerApplication(CeeJourneyTypeEnum.Short, data, constraint);
  }

  async registerLongApplication(data: LongCeeApplication, constraint: ApplicationCooldownConstraint): Promise<string> {
    return this.registerApplication(CeeJourneyTypeEnum.Long, data, constraint);
  }

  async importApplication(data: CeeApplication & { journey_type: CeeJourneyTypeEnum }): Promise<void> {
    const { journey_type, ...application } = data;
    await this.registerApplication(journey_type, application);
    return;
  }
}
