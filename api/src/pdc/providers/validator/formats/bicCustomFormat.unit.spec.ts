import { assert, assertFalse, it } from "@/dev_deps.ts";
import { bicCustomFormat } from "./bicCustomFormat.ts";

it("valid BIC short string", (t) => {
  const bic = "ABNANL2A";
  assert((bicCustomFormat as any)(bic));
});

it("valid BIC padding X", (t) => {
  const bic = "ABNANL2AXXX";
  assert((bicCustomFormat as any)(bic));
});

it("invalid BIC too short", (t) => {
  const bic = "012345";
  assertFalse((bicCustomFormat as any)(bic));
});

it("invalid BIC too long", (t) => {
  const bic = "00331234567890";
  assertFalse((bicCustomFormat as any)(bic));
});
