import { provider } from "@/ilos/common/index.ts";
import { DenoPostgresConnection } from "@/ilos/connection-postgres/index.ts";
import sql, { raw } from "@/lib/pg/sql.ts";
import {
  ParamsInterface as FindBySirenParamsInterface,
  ResultInterface as FindBySirenResultInterface,
} from "@/pdc/services/territory/contracts/findGeoBySiren.contract.ts";
import { FindBySiretRawResultInterface } from "../interfaces/FindBySiretRawResultInterface.ts";
import {
  GeoRepositoryProviderInterface,
  GeoRepositoryProviderInterfaceResolver,
} from "../interfaces/GeoRepositoryProviderInterface.ts";

@provider({
  identifier: GeoRepositoryProviderInterfaceResolver,
})
export class GeoRepositoryProvider implements GeoRepositoryProviderInterface {
  public readonly getMillesimeFunction = "geo.get_latest_millesime";

  constructor(protected pgConnection: DenoPostgresConnection) {}

  async findBySiren(
    params: FindBySirenParamsInterface,
  ): Promise<FindBySirenResultInterface> {
    const yearRows = await this.pgConnection.query<{ year: number }>(sql`
      SELECT * from ${raw(this.getMillesimeFunction)}() as year
    `);
    const year = yearRows[0]?.year;

    const sirenFilter = (params.siren.length === 2 || params.siren.length === 3)
      ? sql`(reg = ${params.siren}::varchar OR dep = ${params.siren}::varchar)`
      : sql`(aom = ${params.siren}::varchar OR epci = ${params.siren}::varchar)`;

    const rows = await this.pgConnection.query<FindBySiretRawResultInterface>(sql`
      SELECT l_aom, aom, epci, l_epci, com, l_com, l_reg, reg, l_dep, dep
      FROM geo.perimeters
      WHERE ${sirenFilter}
        AND year = ${year}::int
    `);

    if (!rows[0]) {
      return {
        reg_name: null,
        reg_siren: null,
        aom_name: null,
        dep_name: null,
        dep_siren: null,
        aom_siren: null,
        epci_name: null,
        epci_siren: null,
        coms: [],
      };
    }

    return {
      reg_name: rows[0].l_reg,
      reg_siren: rows[0].reg,
      aom_name: rows[0].l_aom,
      aom_siren: rows[0].aom,
      dep_name: rows[0].l_dep,
      dep_siren: rows[0].dep,
      epci_name: rows[0].l_epci,
      epci_siren: rows[0].epci,
      coms: rows.map((g) => ({
        insee: g.com,
        name: g.l_com,
      })),
    };
  }
}
