import { provider } from "@/ilos/common/index.ts";
import { DenoPostgresConnection } from "@/ilos/connection-postgres/index.ts";
import sql, { raw } from "@/lib/pg/sql.ts";

@provider()
export class UserRepository {
  public readonly table = "auth.users";
  public readonly territoryTable = "territory.territory_group";
  public readonly operatorTable = "operator.operators";
  public readonly companyTable = "company.companies";

  constructor(
    protected denoConnection: DenoPostgresConnection,
  ) {}

  async findUserByEmail(email: string) {
    const rows = await this.denoConnection.query(sql`
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
    `);

    return rows[0] || null;
  }

  async touchLastLogin(_id: number) {
    await this.denoConnection.query(sql`
      UPDATE ${raw(this.table)}
      SET last_login_at = NOW()
      WHERE _id = ${_id}
    `);
  }
}
