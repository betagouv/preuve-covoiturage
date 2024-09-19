import { assertEquals, it } from "@/dev_deps.ts";
import { identitySelectorHelper } from "@/pdc/services/certificate/helpers/identitySelectorHelper.ts";
import { CarpoolTypeEnum } from "@/shared/certificate/common/interfaces/CarpoolInterface.ts";

it("identity_key", () => {
  const result = identitySelectorHelper(CarpoolTypeEnum.DRIVER, [
    { identity_key: "key" },
  ]);
  assertEquals(result, "AND (cc.driver_identity_key = 'key')");
});

it("phone", () => {
  const result = identitySelectorHelper(CarpoolTypeEnum.DRIVER, [
    { phone: "phone" },
  ]);
  assertEquals(result, "AND (cc.driver_phone = 'phone')");
});

it("phone_trunc and operator_user_id", () => {
  const result = identitySelectorHelper(CarpoolTypeEnum.DRIVER, [
    { phone_trunc: "phone", operator_user_id: "operator" },
  ]);
  assertEquals(
    result,
    "AND (cc.driver_phone_trunc = 'phone' AND cc.driver_operator_user_id = 'operator')",
  );
});

it("operator_user_id", () => {
  const result = identitySelectorHelper(CarpoolTypeEnum.DRIVER, [
    { operator_user_id: "operator" },
  ]);
  assertEquals(result, "AND (cc.driver_operator_user_id = 'operator')");
});

it("multiple identity_key", () => {
  const result = identitySelectorHelper(CarpoolTypeEnum.DRIVER, [
    { identity_key: "key" },
    { identity_key: "key2" },
  ]);
  assertEquals(
    result,
    "AND (cc.driver_identity_key = 'key' OR cc.driver_identity_key = 'key2')",
  );
});

it("multiple key and phone", () => {
  const result = identitySelectorHelper(CarpoolTypeEnum.DRIVER, [
    { identity_key: "key" },
    { phone: "phone" },
  ]);
  assertEquals(
    result,
    "AND (cc.driver_identity_key = 'key' OR cc.driver_phone = 'phone')",
  );
});

it("passenger identity_key", () => {
  const result = identitySelectorHelper(CarpoolTypeEnum.PASSENGER, [
    { identity_key: "key" },
  ]);
  assertEquals(result, "AND (cc.passenger_identity_key = 'key')");
});

it("multiple infos for same passenger", () => {
  const result = identitySelectorHelper(CarpoolTypeEnum.PASSENGER, [
    { identity_key: "key", phone: "phone" },
  ]);
  assertEquals(
    result,
    "AND (cc.passenger_identity_key = 'key')",
  );
});
