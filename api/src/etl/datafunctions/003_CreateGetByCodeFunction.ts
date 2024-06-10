import { AbstractDatafunction } from "../common/AbstractDatafunction.ts";

export class CreateGetByCodeFunction extends AbstractDatafunction {
  static uuid = "create_get_by_code_function";
  static table = "get_by_code";
  static year = 2022;
  readonly sql = `
    CREATE OR REPLACE FUNCTION ${this.functionWithSchema}(code varchar, year smallint) returns table (
      year smallint,
      l_arr varchar,
      arr varchar,
      l_com varchar,
      com varchar,
      l_epci varchar,
      epci varchar,
      l_dep varchar,
      dep varchar,
      l_reg varchar,
      reg varchar,
      l_country varchar,
      country varchar,
      l_aom varchar,
      aom varchar,
      l_reseau varchar,
      reseau int,
      pop int,
      surface real 
    ) as $$
      SELECT 
        year,
        l_arr,
        arr,
        l_com,
        com,
        l_epci,
        epci,
        l_dep,
        dep,
        l_reg,
        reg,
        l_country,
        country,
        l_aom,
        aom,
        l_reseau,
        reseau,
        pop,
        surface
      FROM ${this.targetTableWithSchema}
      WHERE
        arr = $1 AND
        year = $2
      LIMIT 1
    $$ language sql;
  `;
}
