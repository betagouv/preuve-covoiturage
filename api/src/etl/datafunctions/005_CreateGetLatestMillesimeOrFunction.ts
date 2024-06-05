import { AbstractDatafunction } from '../common/AbstractDatafunction.ts';

export class CreateGetLatestMillesimeOrFunction extends AbstractDatafunction {
  static uuid = 'create_get_latest_millesime_or_function';
  static table = 'get_latest_millesime_or';
  static year = 2022;
  readonly sql = `
    CREATE OR REPLACE FUNCTION ${this.functionWithSchema}(l smallint) returns smallint as $$
      SELECT max(year) as year FROM ${this.targetTableWithSchema} WHERE year = $1
      UNION ALL
      SELECT max(year) as year FROM ${this.targetTableWithSchema}
      ORDER BY year
      LIMIT 1
    $$ language sql;
  `;
}
