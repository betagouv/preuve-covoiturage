import { assert, assertFalse, it } from "@/dev_deps.ts";

import { rnaCustomFormat } from "./rnaCustomFormat.ts";

it("valid RNA", (t) => {
  const rna = "W802005251";
  assert((rnaCustomFormat as any)(rna));
});

it("too short", (t) => {
  const rna = "W12345";
  assertFalse((rnaCustomFormat as any)(rna));
});

it("too long", (t) => {
  const rna = "W00331234567890";
  assertFalse((rnaCustomFormat as any)(rna));
});
