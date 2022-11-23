import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import { CeeApplication, CeeJourneyTypeEnum, CeeRepositoryProviderInterfaceResolver, LongCeeApplication, RegisteredCeeApplication, SearchCeeApplication, SearchJourney, ShortCeeApplication, ValidJourney } from '../interfaces';

@provider({
  identifier: CeeRepositoryProviderInterfaceResolver, 
})
export class CeeRepositoryProvider extends CeeRepositoryProviderInterfaceResolver {
  public readonly table = 'policy.cee_applications';

  constructor(protected connection: PostgresConnection) {
    super();
  }

  protected async searchForApplication(
    journeyType: CeeJourneyTypeEnum,
    search: SearchCeeApplication,
  ): Promise<RegisteredCeeApplication | void> {
    const query = {
      text: `
        SELECT
          _id,
          operator_id,
          datetime
        FROM ${this.table}
        WHERE 
          journey_type = $1 AND (
            (last_name_trunc = $2 AND phone_trunc = $3)
            ${search.driving_license ? 'OR driving_license = $4' : ''}
          )
        ORDER BY datetime DESC
        LIMIT 1
      `,
      values: [
        journeyType,
        search.last_name_trunc,
        search.phone_trunc,
        ...(search.driving_license ? [search.driving_license] : []),
      ],
    };
    const result = await this.connection.getClient().query<RegisteredCeeApplication>(query);
    return result.rows[0];
  }

  async searchForShortApplication(search: SearchCeeApplication): Promise<RegisteredCeeApplication | void> {
    return await this.searchForApplication(CeeJourneyTypeEnum.Short, search);
  }

  async searchForLongApplication(search: SearchCeeApplication): Promise<RegisteredCeeApplication | void> {
    return await this.searchForApplication(CeeJourneyTypeEnum.Long, search);
  }

  async searchForValidJourney(search: SearchJourney): Promise<ValidJourney | void> {}

  protected async registerApplication(
    journeyType: CeeJourneyTypeEnum,
    data: ShortCeeApplication | LongCeeApplication | CeeApplication,
    importOldApplication = false,
  ): Promise<void> {
    const fields = [
      ['journey_type', 'policy.journey_type_enum'],
      ['operator_id', 'int'],
      ['last_name_trunc', 'varchar'],
      ['phone_trunc', 'varchar'],
      ['datetime', 'timestamp'],
    ];
    const values = [journeyType, data.operator_id, data.last_name_trunc, data.phone_trunc, data.datetime];

    if(!importOldApplication) {
      if (journeyType === CeeJourneyTypeEnum.Long || journeyType === CeeJourneyTypeEnum.Short) {
        fields.push(['driving_license', 'varchar']);
        values.push('driving_license' in data ? data.driving_license : undefined);
      }
      if (journeyType === CeeJourneyTypeEnum.Short) {
        fields.push(['carpool_id', 'int']);
        values.push('carpool_id' in data ? data.carpool_id : undefined);
      }
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

    if (!importOldApplication) {
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

  async registerShortApplication(data: ShortCeeApplication): Promise<void> {
    return this.registerApplication(CeeJourneyTypeEnum.Short, data);
  }

  async registerLongApplication(data: LongCeeApplication): Promise<void> {
    return this.registerApplication(CeeJourneyTypeEnum.Long, data);
  }

  async importApplication(data: CeeApplication & { journey_type: CeeJourneyTypeEnum }): Promise<void> {
    const { journey_type, ...application } = data;
    return this.registerApplication(journey_type, application, true);
  }
}