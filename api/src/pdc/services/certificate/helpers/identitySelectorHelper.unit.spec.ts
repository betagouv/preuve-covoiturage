// deno-fmt-ignore-file

import { assertEquals, it } from "@/dev_deps.ts";
import { CarpoolTypeEnum } from "@/pdc/services/certificate/contracts/common/interfaces/CarpoolInterface.ts";
import { identitySelectorHelper } from "@/pdc/services/certificate/helpers/identitySelectorHelper.ts";

it("identity_key", () => {
  const result = identitySelectorHelper(CarpoolTypeEnum.DRIVER, [
    { identity_key: "key" },
  ]);
  assertEquals(result.sql, "AND (cc.driver_identity_key = ?)");
  assertEquals(result.values, ["key"]);
});

it("phone", () => {
  const result = identitySelectorHelper(CarpoolTypeEnum.DRIVER, [
    { phone: "phone" },
  ]);
  assertEquals(result.sql, "AND (cc.driver_phone = ?)");
  assertEquals(result.values, ["phone"]);
});

it("phone_trunc and operator_user_id", () => {
  const result = identitySelectorHelper(CarpoolTypeEnum.DRIVER, [
    { phone_trunc: "phone", operator_user_id: "operator" },
  ]);
  assertEquals(result.sql, "AND (cc.driver_phone_trunc = ? AND cc.driver_operator_user_id = ?)");
  assertEquals(result.values, ["phone", "operator"]);
});

it("operator_user_id", () => {
  const result = identitySelectorHelper(CarpoolTypeEnum.DRIVER, [
    { operator_user_id: "operator" },
  ]);
  assertEquals(result.sql, "AND (cc.driver_operator_user_id = ?)");
  assertEquals(result.values, ["operator"]);
});

it("multiple identity_key", () => {
  const result = identitySelectorHelper(CarpoolTypeEnum.DRIVER, [
    { identity_key: "key" },
    { identity_key: "key2" },
  ]);
  assertEquals(result.sql, "AND (cc.driver_identity_key = ? OR cc.driver_identity_key = ?)");
  assertEquals(result.values, ["key", "key2"]);
});

it("multiple key and phone", () => {
  const result = identitySelectorHelper(CarpoolTypeEnum.DRIVER, [
    { identity_key: "key" },
    { phone: "phone" },
  ]);
  assertEquals(result.sql, "AND (cc.driver_identity_key = ? OR cc.driver_phone = ?)");
  assertEquals(result.values, ["key", "phone"]);
});

it("passenger identity_key", () => {
  const result = identitySelectorHelper(CarpoolTypeEnum.PASSENGER, [
    { identity_key: "key" },
  ]);
  assertEquals(result.sql, "AND (cc.passenger_identity_key = ?)");
  assertEquals(result.values, ["key"]);
});

it("multiple infos for same passenger", () => {
  const result = identitySelectorHelper(CarpoolTypeEnum.PASSENGER, [
    { identity_key: "key", phone: "phone" },
  ]);
  assertEquals(result.sql, "AND (cc.passenger_identity_key = ?)");
  assertEquals(result.values, ["key"]);
});
