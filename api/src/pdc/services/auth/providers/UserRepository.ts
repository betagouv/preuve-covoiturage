import { provider } from "@/ilos/common/index.ts";
import { LegacyPostgresConnection } from "@/ilos/connection-postgres/index.ts";
import sql, { raw } from "@/lib/pg/sql.ts";

@provider()
export class UserRepository {
  public readonly table = "auth.users";
  public readonly territoryTable = "territory.territory_group";
  public readonly operatorTable = "operator.operators";
  public readonly companyTable = "company.companies";

  constructor(
    protected connection: LegacyPostgresConnection,
  ) {}

  async findUserByEmail(email: string) {
    const query = sql`
      SELECT
        u.email,
        u.role,
        u.operator_id,
        u.territory_id,
        COALESCE(o.siret, c.siret) as siret,
        u._id
      FROM ${raw(this.table)} u
      LEFT JOIN ${raw(this.territoryTable)} t
        ON t._id = u.territory_id
      LEFT JOIN ${raw(this.companyTable)} c on c._id = t.company_id
      LEFT JOIN ${raw(this.operatorTable)} o
        ON o._id = u.operator_id
      WHERE u.email = ${email}
      LIMIT 1
    `;
    const results = await this.connection.getClient().query(query);
    return results.rows[0];
  }

  async touchLastLogin(_id: number) {
    const query = sql`UPDATE ${raw(this.table)} SET last_login_at = NOW() WHERE _id = ${_id}`;
    await this.connection.getClient().query(query);
  }
}
