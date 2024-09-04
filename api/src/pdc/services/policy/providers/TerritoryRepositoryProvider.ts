import { NotFoundException, provider } from "@/ilos/common/index.ts";
import { PostgresConnection } from "@/ilos/connection-postgres/index.ts";
import { logger } from "@/lib/logger/index.ts";
import {
  TerritoryCodeEnum,
  TerritoryCodeInterface,
  TerritoryRepositoryProviderInterface,
  TerritoryRepositoryProviderInterfaceResolver,
  TerritorySelectorsInterface,
} from "../interfaces/index.ts";

@provider({
  identifier: TerritoryRepositoryProviderInterfaceResolver,
})
export class TerritoryRepositoryProvider
  implements TerritoryRepositoryProviderInterface {
  protected readonly getTerritorySelectorFn =
    "territory.get_selector_by_territory_id";
  protected readonly getByPointFunction = "geo.get_latest_by_point";
  protected readonly getBySelectorFunction =
    "policy.get_territory_id_by_selector";
  protected readonly territoryGroupTable = "territory.territory_group";
  protected readonly territorySelectorTable =
    "territory.territory_group_selector";
  protected readonly operatorTable = "operator.operators";
  protected readonly companyTable = "company.companies";

  constructor(protected connection: PostgresConnection) {}

  async findByPoint(
    { lon, lat }: { lon: number; lat: number },
  ): Promise<TerritoryCodeInterface> {
    try {
      const result = await this.connection.getClient().query<any>({
        text: `
          SELECT * FROM ${this.getByPointFunction}($1::float, $2::float)
        `,
        values: [lon, lat],
      });

      if (result.rowCount < 1) {
        throw new NotFoundException();
      }
      return result.rows[0];
    } catch (e) {
      logger.error(e.message, e);
      return null;
    }
  }

  async findUUIDByOperatorId(_id: number): Promise<string> {
    const query = {
      text: `
        SELECT
          o._id, c.uuid
        FROM ${this.operatorTable} AS o
        LEFT JOIN ${this.companyTable} AS c
          ON c._id = o.company_id
        WHERE o._id = $1 LIMIT 1
      `,
      values: [_id],
    };
    const result = await this.connection.getClient().query<any>(query);

    if (result.rowCount < 1) {
      throw new NotFoundException();
    }

    return result.rows[0]?.uuid;
  }

  async findUUIDById(
    _id: number | number[],
  ): Promise<{ _id: number; uuid: string }[]> {
    const query = {
      text: `
        SELECT
          t._id, c.uuid
        FROM ${this.territoryGroupTable} AS t
        LEFT JOIN ${this.companyTable} AS c
          ON c._id = t.company_id
        WHERE t._id = ${Array.isArray(_id) ? "ANY($1)" : "$1"}
      `,
      values: [_id],
    };
    const result = await this.connection.getClient().query<any>(query);
    return result.rows;
  }

  async findBySelector(
    data: Partial<TerritoryCodeInterface>,
  ): Promise<number[]> {
    const result = await this.connection.getClient().query<any>({
      text:
        `SELECT _id FROM ${this.getBySelectorFunction}($1::varchar, $2::varchar)`,
      values: [
        data[TerritoryCodeEnum.Arr] || data[TerritoryCodeEnum.City],
        data[TerritoryCodeEnum.Mobility],
      ],
    });
    return result.rows.map((r) => r._id);
  }

  async findSelectorFromId(id: number): Promise<TerritorySelectorsInterface> {
    const query = {
      text: `
        SELECT * FROM ${this.getTerritorySelectorFn}($1) 
      `,
      values: [[id]],
    };
    const result = await this.connection.getClient().query<any>(query);
    if (result.rowCount !== 1) {
      throw new NotFoundException();
    }
    return result.rows[0].selector;
  }
}
