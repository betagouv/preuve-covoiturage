import { provider } from "@/ilos/common/Decorators.ts";
import { DenoPostgresConnection } from "@/ilos/connection-postgres/index.ts";
import sql, { raw } from "@/lib/pg/sql.ts";
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
  public async getTerritorySelectors(_territoryId: number): Promise<TerritorySelectorsInterface> {
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

  constructor(protected connection: DenoPostgresConnection) {}

  /**
   * Get the territory selectors for a given territory
   *
   * @param territoryId
   * @returns
   */
  public async getTerritorySelectors(territoryId: number): Promise<TerritorySelectorsInterface> {
    const q = sql`SELECT * FROM ${raw(this.pivotTable)} WHERE territory_group_id = ${territoryId}`;
    const rows = await this.connection.query<PivotTerritorySelector>(q);

    return rows.length ? this.formatSelectors(rows) : {};
  }

  /**
   * Convert the pivot table rows to a TerritorySelectorsInterface
   *
   * @param rows
   */
  private formatSelectors(rows: PivotTerritorySelector[]): TerritorySelectorsInterface {
    return rows.reduce((acc, row) => {
      acc[row.selector_type as keyof TerritorySelectorsInterface] = [
        ...(acc[row.selector_type as keyof TerritorySelectorsInterface] || []),
        row.selector_value,
      ];
      return acc;
    }, {} as TerritorySelectorsInterface);
  }
}
