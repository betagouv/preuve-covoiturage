import { CarpoolTypeEnum } from "@/shared/certificate/common/interfaces/CarpoolInterface.ts";
import { IdentityIdentifiersInterface } from "@/shared/certificate/common/interfaces/IdentityIdentifiersInterface.ts";

export function identitySelectorHelper(
  type: CarpoolTypeEnum,
  identities: IdentityIdentifiersInterface[],
): string {
  const sel = [];
  for (const id of identities) {
    const { identity_key, phone, phone_trunc, operator_user_id } = id;

    if (identity_key) {
      sel.push(`cc.${type}_identity_key = '${identity_key}'`);
      continue;
    }
    if (phone) {
      sel.push(`cc.${type}_phone = '${phone}'`);
      continue;
    }
    if (phone_trunc && operator_user_id) {
      sel.push(
        `cc.${type}_phone_trunc = '${phone_trunc}' AND cc.${type}_operator_user_id = '${operator_user_id}'`,
      );
      continue;
    }
    if (operator_user_id) {
      sel.push(`cc.${type}_operator_user_id = '${operator_user_id}'`);
      continue;
    }
  }

  return sel.length ? `AND (${sel.join(" OR ")})` : "";
}
