import { provider } from "@/ilos/common/Decorators.ts";
import { LegacyPostgresConnection } from "@/ilos/connection-postgres/index.ts";
import {
  TerritoryCodeEnum,
  TerritorySelectorsInterface,
} from "@/pdc/services/territory/contracts/common/interfaces/TerritoryCodeInterface.ts";

interface PivotTerritorySelector {
  territory_group_id: number;
  selector_type: TerritoryCodeEnum;
  selector_value: string;
}

export abstract class TerritoryRepositoryInterfaceResolver {
  public async getTerritorySelectors(
    territoryId: number,
  ): Promise<TerritorySelectorsInterface> {
    throw new Error("Not implemented");
  }
}

@provider({
  identifier: TerritoryRepositoryInterfaceResolver,
})
export class TerritoryRepository {
  public readonly territoryTable = "territory.territory_group";
  public readonly pivotTable = "territory.territory_group_selector";
  public readonly geoTable = "geo.perimeters";

  constructor(protected connection: LegacyPostgresConnection) {}

  /**
   * Get the territory selectors for a given territory
   *
   * @param territoryId
   * @returns
   */
  public async getTerritorySelectors(
    territoryId: number,
  ): Promise<TerritorySelectorsInterface> {
    const query = {
      text: `SELECT * FROM ${this.pivotTable} WHERE territory_group_id = $1`,
      values: [territoryId],
    };

    const { rows, rowCount } = await this.connection.getClient().query(query);

    return rowCount ? this.formatSelectors(rows) : {};
  }

  /**
   * Convert the pivot table rows to a TerritorySelectorsInterface
   *
   * @param rows
   */
  private formatSelectors(
    rows: PivotTerritorySelector[],
  ): TerritorySelectorsInterface {
    return rows.reduce((acc, row) => {
      acc[row.selector_type] = [
        ...(acc[row.selector_type] || []),
        row.selector_value,
      ];
      return acc;
    }, {} as TerritorySelectorsInterface);
  }
}
