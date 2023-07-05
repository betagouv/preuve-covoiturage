import { InvalidRequestException, NotFoundException } from '@ilos/common';
import { ConflictException } from '@ilos/common';
import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import {
  ApplicationCooldownConstraint,
  CeeApplication,
  CeeJourneyTypeEnum,
  CeeRepositoryProviderInterfaceResolver,
  LongCeeApplication,
  SearchCeeApplication,
  SearchJourney,
  ShortCeeApplication,
  ValidJourney,
  ValidJourneyConstraint,
  RegisteredCeeApplication,
  CeeApplicationError,
  ExistingCeeApplication,
} from '../interfaces';

@provider({
  identifier: CeeRepositoryProviderInterfaceResolver,
})
export class CeeRepositoryProvider extends CeeRepositoryProviderInterfaceResolver {
  public readonly table = 'cee.cee_applications';
  public readonly errorTable = 'cee.cee_application_errors';
  public readonly carpoolTable = 'carpool.carpools';
  public readonly identityTable = 'carpool.identities';
  public readonly operatorTable = 'operator.operators';

  constructor(protected connection: PostgresConnection) {
    super();
  }

  protected async searchForApplication(
    journeyType: CeeJourneyTypeEnum,
    search: SearchCeeApplication,
    constraint: ApplicationCooldownConstraint,
  ): Promise<ExistingCeeApplication | void> {
    const { text, values } = [['identity_key'], ['driving_license'], ['last_name_trunc', 'phone_trunc']]
      .filter((k) => !k.filter((kk) => !(kk in search)).length)
      .map((k, i) => ({
        text: `(${k.map((kk, ii) => `ce.${kk} = $${i + ii + 6}`).join(' AND ')})`,
        value: k.map((kk) => search[kk]),
      }))
      .reduce(
        (acc, v) => {
          acc.text.push(v.text);
          acc.values.push(...v.value);
          return acc;
        },
        { text: [], values: [] },
      );

    const query = {
      text: `
        SELECT
          ce._id as uuid,
          ce.operator_id,
          ce.datetime,
          ce.journey_type,
          ce.driving_license,
          op.siret as operator_siret,
          cc.acquisition_id,
          cc.status as acquisition_status
        FROM ${this.table} AS ce
        JOIN ${this.operatorTable} AS op
          ON op._id = ce.operator_id
        LEFT JOIN ${this.carpoolTable} AS cc
          ON cc._id = ce.carpool_id
        WHERE 
          ce.journey_type = $1::cee.journey_type_enum AND
          ce.datetime >= ($5::timestamp - $2::int * interval '1 year') AND
          ce.is_specific = false AND (
            ${values.length ? text.join(' OR ') : ''}
          )
        UNION
        SELECT
          ce._id as uuid,
          ce.operator_id,
          ce.datetime,
          ce.journey_type,
          ce.driving_license,
          op.siret as operator_siret,
          cc.acquisition_id,
          cc.status as acquisition_status
        FROM ${this.table} AS ce
        JOIN ${this.operatorTable} AS op
          ON op._id = ce.operator_id
        LEFT JOIN ${this.carpoolTable} AS cc
          ON cc._id = ce.carpool_id
        WHERE
          ce.journey_type = $1::cee.journey_type_enum AND
          (
            ce.datetime >= ($5::timestamp - $3::int * interval '1 year') AND
            ce.datetime >= $4::timestamp
          ) AND
          ce.is_specific = true AND (
            ${values.length ? text.join('OR') : ''}
          )
        ORDER BY datetime DESC
        LIMIT 1
      `,
      values: [
        journeyType,
        journeyType === CeeJourneyTypeEnum.Short
          ? constraint.short.standardized.year
          : constraint.long.standardized.year,
        journeyType === CeeJourneyTypeEnum.Short ? constraint.short.specific.year : constraint.long.specific.year,
        journeyType === CeeJourneyTypeEnum.Short ? constraint.short.specific.after : constraint.long.specific.after,
        search.datetime,
        ...values,
      ],
    };
    const result = await this.connection.getClient().query<ExistingCeeApplication>(query);
    return result.rows[0];
  }

  async searchForShortApplication(
    search: SearchCeeApplication,
    constraint: ApplicationCooldownConstraint,
  ): Promise<ExistingCeeApplication | void> {
    return await this.searchForApplication(CeeJourneyTypeEnum.Short, search, constraint);
  }

  async searchForLongApplication(
    search: SearchCeeApplication,
    constraint: ApplicationCooldownConstraint,
  ): Promise<ExistingCeeApplication | void> {
    return await this.searchForApplication(CeeJourneyTypeEnum.Long, search, constraint);
  }

  async searchForValidJourney(search: SearchJourney, constraint: ValidJourneyConstraint): Promise<ValidJourney> {
    const query = {
      text: `
        SELECT
          cc.acquisition_id AS acquisition_id,
          cc._id AS carpool_id,
          CASE 
            WHEN ci.phone_trunc IS NULL THEN left(ci.phone, -2)
            ELSE ci.phone_trunc
          END AS phone_trunc,
          cc.datetime + cc.duration * interval '1 second' AS datetime,
          cc.status AS status,
          CASE
            WHEN ce._id IS NULL THEN false
            ELSE true
          END as already_registered,
          ci.identity_key
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
          COALESCE(cc.distance, (cc.meta#>'{calc_distance}')::text::int) <= $6 AND
          (cc.start_geo_code NOT LIKE $7 OR cc.end_geo_code NOT LIKE $7) AND
          cc.is_driver = true
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
      throw new NotFoundException();
    }
    return result.rows[0];
  }

  protected async registerApplication(
    journeyType: CeeJourneyTypeEnum,
    data: ShortCeeApplication | LongCeeApplication | CeeApplication,
    constraint?: ApplicationCooldownConstraint,
  ): Promise<RegisteredCeeApplication> {
    const fields = [
      ['journey_type', 'cee.journey_type_enum'],
      ['operator_id', 'int'],
      ['last_name_trunc', 'varchar'],
      ['phone_trunc', 'varchar'],
      ['datetime', 'timestamp'],
      ['application_timestamp', 'timestamp'],
      ['identity_key', 'varchar'],
    ];
    const values: Array<any> = [
      journeyType,
      data.operator_id,
      data.last_name_trunc,
      data.phone_trunc,
      data.datetime,
      data.application_timestamp,
      data.identity_key,
    ];

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
             cep.driving_license = tmp.driving_license OR
             cep.identity_key = tmp.identity_key
          ) AND (
            cep.datetime >= tmp.datetime::timestamp - $${values.length + 1} * interval '1 year' AND
            cep.datetime >= $${values.length + 2}
          )
        LEFT JOIN ${this.table} AS ced on 
          ced.is_specific = false AND
          ced.journey_type = tmp.journey_type AND
          (
            (ced.last_name_trunc = tmp.last_name_trunc AND ced.phone_trunc = tmp.phone_trunc) OR
             ced.driving_license = tmp.driving_license OR
             ced.identity_key = tmp.identity_key
          ) AND
          ced.datetime >= tmp.datetime::timestamp - $${values.length + 3} * interval '1 year'
        WHERE
          cep._id IS NULL AND
          ced._id IS NULL
      `;
      values.push(
        journeyType === CeeJourneyTypeEnum.Short ? constraint.short.specific.year : constraint.long.specific.year,
      );
      values.push(
        journeyType === CeeJourneyTypeEnum.Short ? constraint.short.specific.after : constraint.long.specific.after,
      );
      values.push(
        journeyType === CeeJourneyTypeEnum.Short
          ? constraint.short.standardized.year
          : constraint.long.standardized.year,
      );
    }

    query.text = `${query.text} RETURNING _id`;
    const result = await this.connection.getClient().query(query);
    if (result.rowCount !== 1) {
      // s'il n'y a pas eu d'enregistrement c'est qu'un autre est déjà actif
      throw new ConflictException();
    }

    const siretResult = await this.connection.getClient().query({
      text: `SELECT siret FROM ${this.operatorTable} WHERE _id = $1`,
      values: [data.operator_id],
    });

    if (result.rowCount !== 1) {
      throw new InvalidRequestException('Operator not found');
    }

    return {
      uuid: result.rows[0]?._id,
      operator_id: data.operator_id,
      datetime: data.datetime,
      operator_siret: siretResult.rows[0]?.siret,
      journey_type: journeyType,
      driving_license: 'driving_license' in data ? data.driving_license : undefined,
    };
  }

  async registerShortApplication(
    data: ShortCeeApplication,
    constraint: ApplicationCooldownConstraint,
  ): Promise<RegisteredCeeApplication> {
    return this.registerApplication(CeeJourneyTypeEnum.Short, data, constraint);
  }

  async registerLongApplication(
    data: LongCeeApplication,
    constraint: ApplicationCooldownConstraint,
  ): Promise<RegisteredCeeApplication> {
    return this.registerApplication(CeeJourneyTypeEnum.Long, data, constraint);
  }

  async importApplication(data: CeeApplication & { journey_type: CeeJourneyTypeEnum }): Promise<void> {
    const { journey_type, ...application } = data;
    await this.registerApplication(journey_type, application);
    return;
  }

  async registerApplicationError(data: CeeApplicationError): Promise<void> {
    const objectKeys = Object.keys(data);
    const keys = [
      'operator_id',
      'error_type',
      'journey_type',
      'datetime',
      'last_name_trunc',
      'phone_trunc',
      'driving_license',
      'operator_journey_id',
      'application_id',
      'identity_key',
    ].filter((k) => objectKeys.includes(k));
    const values = keys.map((k) => data[k]);

    const query = {
      values,
      text: `
        INSERT INTO ${this.errorTable} (${keys.join(',')})
        VALUES(${keys.map((_, i) => `$${i + 1}`).join(',')})
      `,
    };

    await this.connection.getClient().query(query);
  }

  async importSpecificApplicationIdentity(
    data: Required<CeeApplication> & { journey_type: CeeJourneyTypeEnum },
  ): Promise<void> {
    const result = await this.connection.getClient().query({
      text: `
        UPDATE ${this.table}
          SET identity_key = $1
        WHERE
          operator_id = $2 AND
          journey_type = $3 AND
          last_name_trunc = $4 AND
          phone_trunc = $5 AND
          datetime = $6 AND
          is_specific = true AND
          identity_key IS NULL
        RETURNING _id
      `,
      values: [
        data.identity_key,
        data.operator_id,
        data.journey_type,
        data.last_name_trunc,
        data.phone_trunc,
        data.application_timestamp,
      ],
    });

    if (result.rowCount === 0) {
      throw new NotFoundException();
    }
  }

  async importStandardizedApplicationIdentity(data: {
    cee_application_uuid: string;
    identity_key: string;
    operator_id: number;
  }): Promise<void> {
    const result = await this.connection.getClient().query({
      text: `
        UPDATE ${this.table}
          SET identity_key = $1
        WHERE
          _id = $2 AND
          operator_id = $3 AND
          is_specific = false AND
          identity_key IS NULL
        RETURNING _id
      `,
      values: [data.identity_key, data.cee_application_uuid, data.operator_id],
    });

    if (result.rowCount === 0) {
      throw new NotFoundException();
    }
  }
}
