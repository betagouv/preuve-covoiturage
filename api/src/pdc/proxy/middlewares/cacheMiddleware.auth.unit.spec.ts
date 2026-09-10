import { assertEquals, assertInstanceOf } from "dep:assert";
import { describe, it } from "dep:testing-bdd";
import { ForbiddenException } from "@/ilos/common/index.ts";
import { NextFunction, Request, Response } from "dep:express";
import { cacheMiddleware } from "./cacheMiddleware.ts";

function run(authToken: string, header?: string): unknown {
  const mw = cacheMiddleware({ enabled: false, driver: null, gzipped: false, authToken });
  let nextArg: unknown = "not-called";
  const next: NextFunction = (e?: unknown) => (nextArg = e);
  const req = { headers: header !== undefined ? { "x-route-cache-auth": header } : {} } as unknown as Request;
  mw.auth()(req, {} as Response, next);
  return nextArg;
}

describe("cacheMiddleware.auth", () => {
  it("passes with the right token", () => assertEquals(run("s3cret", "s3cret"), undefined));
  it("forbids a wrong token", () => assertInstanceOf(run("s3cret", "nope"), ForbiddenException));
  it("forbids a missing header", () => assertInstanceOf(run("s3cret"), ForbiddenException));
  it("errors when the server token is unset", () => {
    const e = run("", "anything");
    assertInstanceOf(e, Error);
    assertEquals((e as Error).message, "Please set APP_ROUTECACHE_AUTHTOKEN");
  });
});
