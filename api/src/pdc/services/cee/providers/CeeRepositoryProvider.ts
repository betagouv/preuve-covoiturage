import { ConflictException, InvalidRequestException, NotFoundException, provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import { Uuid } from '@pdc/providers/carpool/interfaces';
import {
  ApplicationCooldownConstraint,
  CeeApplication,
  CeeApplicationError,
  CeeJourneyTypeEnum,
  CeeRepositoryProviderInterfaceResolver,
  ExistingCeeApplication,
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
  public readonly ceeApplicationsTable = 'cee.cee_applications';
  public readonly errorTable = 'cee.cee_application_errors';
  /**
   * @deprecated [carpool_v2_migration]
   */
  public readonly carpoolV1Table = 'carpool.carpools';
  public readonly carpoolV2Table = 'carpool_v2.carpools';
  public readonly carpoolV2StatusTable = 'carpool_v2.status';
  public readonly carpoolV2GeoTable = 'carpool_v2.geo';
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
      .map((k, i) => {
        let text = `${k.map((kk, ii) => `ce.${kk} = $${i + ii + 6}`).join(' AND ')}`;
        if (k[0] == 'last_name_trunc') {
          text = `${text} AND ce.identity_key IS NULL`;
        }
        return {
          text: `(${text})`,
          value: k.map((kk) => search[kk]),
        };
      })
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
          ce.operator_journey_id,
          ce.datetime,
          ce.journey_type,
          ce.driving_license,
          op.siret as operator_siret,
          cc.legacy_id as journey_id,
          cs.acquisition_status,
          cs.fraud_status
        FROM ${this.ceeApplicationsTable} AS ce
        JOIN ${this.operatorTable} AS op
          ON op._id = ce.operator_id
        LEFT JOIN ${this.carpoolV2Table} AS cc
          ON ce.operator_id = cc.operator_id AND ce.operator_journey_id = cc.operator_journey_id
        LEFT JOIN ${this.carpoolV2StatusTable} AS cs ON cc._id = cs.carpool_id
        WHERE ce.journey_type = $1::cee.journey_type_enum
          AND ce.datetime >= ($5::timestamp - $2::int * interval '1 year')
          AND ce.is_specific = false
          AND (${values.length ? text.join(' OR ') : ''})

        UNION

        SELECT
          ce._id as uuid,
          ce.operator_id,
          ce.operator_journey_id,
          ce.datetime,
          ce.journey_type,
          ce.driving_license,
          op.siret as operator_siret,
          cc.legacy_id as journey_id,
          cs.acquisition_status,
          cs.fraud_status
        FROM ${this.ceeApplicationsTable} AS ce
        JOIN ${this.operatorTable} AS op
          ON op._id = ce.operator_id
        LEFT JOIN ${this.carpoolV2Table} AS cc
          ON ce.operator_id = cc.operator_id AND ce.operator_journey_id = cc.operator_journey_id
        LEFT JOIN ${this.carpoolV2StatusTable} AS cs ON cc._id = cs.carpool_id
        WHERE ce.journey_type = $1::cee.journey_type_enum
          AND (
            ce.datetime >= ($5::timestamp - $3::int * interval '1 year')
            AND ce.datetime >= $4::timestamp
          )
          AND ce.is_specific = true
          AND (${values.length ? text.join('OR') : ''})

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
    return result.rows.map(this.castOutput<ExistingCeeApplication>)[0];
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
          cc.uuid,
          cc.legacy_id as journey_id,
          CASE
            WHEN cc.driver_phone_trunc IS NULL THEN left(cc.driver_phone, -2)
            ELSE cc.driver_phone_trunc
          END AS phone_trunc,
          cc.end_datetime AS datetime,
          cs.acquisition_status,
          cs.fraud_status,
          ce._id IS NOT NULL AS already_registered,
          cc.driver_identity_key AS identity_key
        FROM ${this.carpoolV2Table} AS cc
        LEFT JOIN ${this.ceeApplicationsTable} ce
          ON ce.operator_id = cc.operator_id AND ce.operator_journey_id = cc.operator_journey_id
        LEFT JOIN ${this.carpoolV2StatusTable} AS cs ON cc._id = cs.carpool_id
        LEFT JOIN ${this.carpoolV2GeoTable} as cg ON cc._id = cg.carpool_id
        WHERE cc.operator_id = $1
          AND cc.operator_journey_id = $2
          AND cc.operator_class = $3
          AND cc.start_datetime >= $4
          AND cc.start_datetime < $5
          AND cc.distance <= $6
          AND (cg.start_geo_code NOT LIKE $7 OR cg.end_geo_code NOT LIKE $7)
        ORDER BY cc.start_datetime DESC
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
    return result.rows.map(this.castOutput<ValidJourney>)[0];
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
      if ('driving_license' in data) {
        fields.push(['driving_license', 'varchar']);
        values.push(data.driving_license);
      }

      /**
       * @deprecated [carpool_v2_migration]
       */
      if (journeyType === CeeJourneyTypeEnum.Short && 'carpool_id' in data) {
        fields.push(['carpool_id', 'int']);
        values.push(data.carpool_id);
      }

      if (journeyType === CeeJourneyTypeEnum.Short && 'operator_journey_id' in data) {
        fields.push(['operator_journey_id', 'varchar']);
        values.push(data.operator_journey_id);
      }
    } else {
      fields.push(['is_specific', 'boolean']);
      values.push(true);
    }

    const query = {
      text: `
        INSERT INTO ${this.ceeApplicationsTable} (${fields.map(([f]) => f).join(',')})
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
        LEFT JOIN ${this.ceeApplicationsTable} AS cep
          ON cep.is_specific = true
          AND cep.journey_type = tmp.journey_type
          AND (
            (
              cep.last_name_trunc = tmp.last_name_trunc
              AND cep.phone_trunc = tmp.phone_trunc
              AND cep.identity_key IS NULL
            )
            OR cep.driving_license = tmp.driving_license
            OR cep.identity_key = tmp.identity_key
          ) AND (
            cep.datetime >= tmp.datetime::timestamp - $${values.length + 1} * interval '1 year' AND
            cep.datetime >= $${values.length + 2}
          )

        LEFT JOIN ${this.ceeApplicationsTable} AS ced
          ON ced.is_specific = false
          AND ced.journey_type = tmp.journey_type
          AND (
            (
              ced.last_name_trunc = tmp.last_name_trunc
              AND ced.phone_trunc = tmp.phone_trunc
              AND ced.identity_key IS NULL
            )
            OR ced.driving_license = tmp.driving_license
            OR ced.identity_key = tmp.identity_key
          )
          AND ced.datetime >= tmp.datetime::timestamp - $${values.length + 3} * interval '1 year'

        WHERE cep._id IS NULL
          AND ced._id IS NULL
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

    query.text = `
      ${query.text}
      ON CONFLICT DO NOTHING
      RETURNING _id
    `;
    const res = await this.connection.getClient().query<{ _id: Uuid }>(query);
    if (res.rowCount !== 1) {
      // s'il n'y a pas eu d'enregistrement c'est qu'un autre est déjà actif
      throw new ConflictException();
    }

    // fetch operator data
    const siretResult = await this.connection.getClient().query<any>({
      text: `SELECT siret FROM ${this.operatorTable} WHERE _id = $1`,
      values: [data.operator_id],
    });

    if (res.rowCount !== 1) {
      throw new InvalidRequestException('Operator not found');
    }

    /**
     * @deprecated [carpool_v2_migration]
     * Fetch and add the carpool_id from carpool.carpools to the CEE application
     */
    await this.connection.getClient().query<any>({
      text: `
        UPDATE ${this.ceeApplicationsTable} ce
        SET carpool_id = c1._id
        FROM ${this.carpoolV1Table} c1
        WHERE c1.operator_id = ce.operator_id
          AND c1.operator_journey_id = ce.operator_journey_id
          AND c1.is_driver = true
          AND c1.datetime >= '2024-01-01T00:00:00+00' -- hit the index!
          AND ce._id = $1
      `,
      values: [res.rows[0]._id],
    });

    // build the return object
    const result: RegisteredCeeApplication = {
      uuid: res.rows[0]?._id,
      operator_id: data.operator_id,
      datetime: data.datetime,
      operator_siret: siretResult.rows[0]?.siret,
      journey_type: journeyType,
    };

    if ('driving_license' in data) result.driving_license = data.driving_license;

    return result;
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

    await this.connection.getClient().query<any>(query);
  }

  async importSpecificApplicationIdentity(
    data: Required<CeeApplication> & { journey_type: CeeJourneyTypeEnum },
  ): Promise<void> {
    const result = await this.connection.getClient().query<any>({
      text: `
        UPDATE ${this.ceeApplicationsTable}
          SET identity_key = $1
        WHERE
          operator_id = $2 AND
          journey_type = $3 AND
          last_name_trunc = $4 AND
          phone_trunc = $5 AND
          is_specific = true AND
          identity_key IS NULL
        RETURNING _id
      `,
      values: [data.identity_key, data.operator_id, data.journey_type, data.last_name_trunc, data.phone_trunc],
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
    const result = await this.connection.getClient().query<any>({
      text: `
        UPDATE ${this.ceeApplicationsTable}
          SET identity_key = $1
        WHERE
          _id = $2 AND
          operator_id = $3 AND
          identity_key IS NULL
        RETURNING _id
      `,
      values: [data.identity_key, data.cee_application_uuid, data.operator_id],
    });

    if (result.rowCount === 0) {
      throw new NotFoundException();
    }
  }

  /**
   * Cast database output to method output
   *
   * Mostly used to cast BIGINT to number
   * as node-postgres returns BIGINT as string.
   *
   * - journey_id (field: legacy_id)
   *
   * The input type has properties overridden as strings.
   *
   * @example queryResult.rows.map(this.castOutput<ExistingCeeApplication>);
   */
  private castOutput<T extends ExistingCeeApplication | ValidJourney>(r: T & { journey_id: string }): T {
    return { ...r, journey_id: Number.parseInt(r.journey_id, 10) };
  }
}
