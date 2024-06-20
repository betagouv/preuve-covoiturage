import { AbstractDatafunction } from "../common/AbstractDatafunction.ts";

export class CreateGetLatestMillesimeFunction extends AbstractDatafunction {
  static uuid = "create_get_latest_millesime_function";
  static table = "get_latest_millesime";
  static year = 2022;
  readonly sql = `
    CREATE OR REPLACE FUNCTION ${this.functionWithSchema}() returns smallint as $$
      SELECT 
        max(year)
      FROM ${this.targetTableWithSchema}
    $$ language sql;
  `;
}
