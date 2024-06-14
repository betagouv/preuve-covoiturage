import { assert, assertFalse, it } from "@/dev_deps.ts";

import { objectidCustomFormat } from "./objectidCustomFormat.ts";

it("valid ObjectId", (t) => {
  const id = "5d07eabd57ce4d70ae6a8508";
  assert((objectidCustomFormat as any)(id));
});

it("valid ObjectId uppercase", (t) => {
  const id = "5d07eb19990207328440c338".toUpperCase();
  assert((objectidCustomFormat as any)(id));
});

it("too short", (t) => {
  const id = "5d07eb199902";
  assertFalse((objectidCustomFormat as any)(id));
});

it("too long", (t) => {
  const id = "5d07eabd57ce4d70ae6a8508d57ce4d7";
  assertFalse((objectidCustomFormat as any)(id));
});

it("wrong chars", (t) => {
  const id = "5d07eb1-.^0207328440c338";
  assertFalse((objectidCustomFormat as any)(id));
});
