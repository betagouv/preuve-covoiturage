import sql, { join, raw, Sql } from "@/lib/pg/sql.ts";
import { CarpoolTypeEnum } from "@/pdc/services/certificate/contracts/common/interfaces/CarpoolInterface.ts";
import { IdentityIdentifiersInterface } from "@/pdc/services/certificate/contracts/common/interfaces/IdentityIdentifiersInterface.ts";

export function identitySelectorHelper(
  type: CarpoolTypeEnum,
  identities: IdentityIdentifiersInterface[],
): Sql {
  const sel = [];

  // deno-fmt-ignore
  for (const id of identities) {
    const { identity_key, phone, phone_trunc, operator_user_id } = id;

    if (identity_key) {
      sel.push(sql`${raw(`cc.${type}_identity_key`)} = ${identity_key}`);
      continue;
    }
    if (phone) {
      sel.push(sql`${raw(`cc.${type}_phone`)} = ${phone}`);
      continue;
    }
    if (phone_trunc && operator_user_id) {
      sel.push(sql`${raw(`cc.${type}_phone_trunc`)} = ${phone_trunc} AND ${raw(`cc.${type}_operator_user_id`)} = ${operator_user_id}`);
      continue;
    }
    if (operator_user_id) {
      sel.push(sql`${raw(`cc.${type}_operator_user_id`)} = ${operator_user_id}`);
      continue;
    }
  }

  return sel.length ? sql`AND (${join(sel, " OR ")})` : sql``;
}
